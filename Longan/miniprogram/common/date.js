module.exports.fgetToDay = getToDay
module.exports.fgetToWeek = getToWeek
module.exports.fgetToMonth = getToMonth

/**
 *
 * @param to 0:this day 2020-11-11
 * @returns {string}
 */
function getToDay(to = 0) {
    const tday = new Date()
    tday.setHours(12, 0, 0, 0)
    return new Date(tday.getTime() - (to * 24 * 60 * 60 * 1000)).toJSON().split("T")[0]
}

/**
 *
 * @param to 0:this year week 2020-w-36
 * @returns {string}
 */
function getToWeek(to = 0) {
    const tdInfo = getToDay(0).split("-")
    const tday = new Date(tdInfo[0], parseInt(tdInfo[1]) - 1, tdInfo[2]),//this day
        yfday = new Date(tdInfo[0], 0, 1),//year first day
        dcount = Math.round((tday.valueOf() - yfday.valueOf()) / 86400000);
    const tweek = Math.ceil((dcount + ((yfday.getDay() + 1) - 1)) / 7) - to
    return tdInfo[0] + "-w-" + tweek
}

/**
 *
 * @param to 0:this year 2020-m-12
 * @returns {string}
 */
function getToMonth(to = 0) {
    const tdInfo = getToDay(0).split("-")
    return tdInfo[0] + "-m-" + (parseInt(tdInfo[1]) - to)
}