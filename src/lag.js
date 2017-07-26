const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const screen = blessed.screen();
const axios = require('axios');
const data = {
  x: [moment().format('LTS')],
  y: [0]
};

module.exports = ({host, period}) => {
  const line = contrib.line({
    style: { line: "yellow", text: "green", baseline: "black"},
    xLabelPadding: 3,
    xPadding: 5,
    label: `NodeJS Event Loop Lag on ${host}`
  });

  screen.append(line);
  line.setData(data);

  screen.key(['escape', 'q', 'C-c'], (ch, key) => {
    return process.exit(0);
  });

  screen.on('resize', function() {
    line.emit('attach');
  });

  screen.render();
  setInterval(() => getLag().then(lag => addData(lag, moment().format('LTS'))), period);

  function addData(lag, time) {
    data.x.push(time);
    data.y.push(lag);
    if (data.x.length === 50) {
      data.y.shift();
      data.x.shift();
    }
    
    line.setData(data);
    screen.render();
  }

  function getLag() {
    return axios.get(`http://${host}/api/monitoring`).then(response => response.data.lag, () => 0);
  }
};
