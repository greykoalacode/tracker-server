const moment = require("moment");
const dateToNumber = (date) => {
  return Number(new Date(date));
  // return Number(new Date(moment(date, "DD-MM-YYYY").format("MM-DD-YYYY")));
};

module.exports = dateToNumber;
