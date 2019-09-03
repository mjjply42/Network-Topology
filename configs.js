const fig_0 = require('./Config1/config_test.js');
const fig_1 = require('./Config1/config_test1.js');
const fig_2 = require('./Config1/config_test2.js');
const fig_3 = require('./Config1/config_test3.js');
const fig_4 = require('./Config1/config_test4.js');
const figs = [];
let match = 0;

const start_arr = [ fig_0, fig_1, fig_2, fig_3, fig_4 ];
for (let i = 0; i < start_arr.length; i++)
{
    if (!start_arr[i]['port'])
        process.exit();
    if (!start_arr[i]['connects'])
        process.exit();
    if (!start_arr[i]['name'])
        process.exit();
    if (typeof start_arr[i]['port'] !== "number")
        process.exit();
    if (typeof start_arr[i]['name'] !== "string")
        process.exit();
    start_arr[i]['connects'].forEach((item) => {
        if (typeof item !== "number")
            process.exit();
        if (item === start_arr[i]['port'])
            process.exit();
        match = start_arr.find((e) => {return e['port'] === item});
        if (match === undefined)
            process.exit();
    })

    figs.push(start_arr[i]);
}

module.exports = figs;