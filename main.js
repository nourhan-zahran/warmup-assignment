const fs = require("fs");
//HELPERSSSSSSS
function timeToSeconds(x){
    // from 12 to 24 hours splits
    let [time, period] = x.split(" ");
    let [h , m ,s] = time.split(":");
    
    h = Number(h);
    m = Number(m);
    s = Number(s);
    
    // 2 - edge cases for 24h convertion
    if (h == 12 && period == "am") {
        h = 0;
    }
    else if (h != 12 && period == "pm") {
        h = h + 12;
    }
    
    // convert it to sec
    let totalSeconds = h*3600 + m*60 + s;
    return totalSeconds;
}

function secondsToTime(x){
    // bac to the forma
    let h = Math.floor(x / 3600);
    let m = Math.floor((x % 3600) / 60);
    let s = x % 60;
    
    // to look clean 
    m = String(m).padStart(2,'0');
    s = String(s).padStart(2,'0');

    return h + ":" + m + ":" + s;
}

function getDayOfWeek(dateString) {
    // Create date object - note: months are 0-indexed in JS!
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month-1 because Jan is 0
    
    // Get day of week as string (e.g., "Friday")
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return daysOfWeek[dayIndex];
}

//END OF HELPERSS

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let duration = timeToSeconds(endTime) - timeToSeconds(startTime);
    
    // 12 am problem , we add extra 24 hours :)
    if (duration < 0) {
        duration += 24 * 3600; 
    }
    
    return secondsToTime(duration);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
     // delivery starts 8:00AM and delivery ends 10:00PM, SO our Total idle time = (time from shiftStart to 8am) + (time from 10pm to shiftEnd)
    // the given start and end times are the employees SHIFT TIME
    //If shiftStart is after 8am, then first part = 0 AND If shiftEnd is before 10pm, then second part = 0
    
    let ShiftStart = timeToSeconds(startTime);
    let ShiftEnd = timeToSeconds(endTime);
    let deliveryStart = timeToSeconds("8:00:00 am");
    let deliveryEnd = timeToSeconds("10:00:00 pm");
    
    let startIdle = 0;
    if (ShiftStart < deliveryStart) {
        startIdle = deliveryStart - ShiftStart;
    }
    
    let endIdle =0;
    if(ShiftEnd > deliveryEnd){
        endIdle = ShiftEnd - deliveryEnd;
    }
    

    let totalIdle = startIdle + endIdle;
    return secondsToTime(totalIdle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let duration = timeToSeconds(shiftDuration);
    let idle = timeToSeconds(idleTime);
    
    //incase we get negativess
    let active = Math.max(0, duration - idle);
    
    return secondsToTime(active);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
        
    let [year, month, day] = date.split("-");
    // to avoid string comparisons , the leading zero format problem - just in casee :) ya3ny 05 > 10 is false but with dates it will be true :(
    year = Number(year);
    month = Number(month);
    day = Number(day);
    
    // Eid: April 10-30 inclusiveee
    let isEid = (year === 2025 && month === 4 && day >= 10 && day <= 30);
    
    let quo = isEid ? 6 * 3600 : ((8 * 3600) + (24 * 60));
    let acTime = timeToSeconds(activeTime);
    
    return acTime >= quo;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {

    //READING AND ORGANISING MY DATA:
    // read data file (one big string :( , )
    const data = fs.readFileSync(textFile, 'utf8');
    // array of full lines (1st line us is our headers) + remove any empties
    const lines = data.split('\n').filter(line => line.trim() !== '');
    // our array of attributes 
    const headers = lines[0].split(',').map(h => h.trim());
    // remove the header , with each iteration for each line we create a values array that seperates 
    //the values of the lines by commas,we create objects ,then we append it to the final array of objects
    //called records 
    // const records = [];
    // for (let i = 1; i < lines.length; i++) {
    //     const values = lines[i].split(','); // mapping stage
    //     const record = {};
        
    //     // Map each value to its header
    //     for (let j = 0; j < headers.length; j++) {
    //         record[headers[j]] = values[j]; //Reduce stage
    //     }
        
    //     records.push(record); //append stage 
    // } SAME CODE JUST LONG AND UGLY 

    const records = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => { //obj is acc , header is curr val , index is curr i
        // Convert header first letter to lowercase for consistent keys
        const key = header.charAt(0).toLowerCase() + header.slice(1);
        obj[key] = values[index];
        return obj;
    }, {});
    });
    
    //LOGIC OF MY METHOD - ana tele3 mayteen omi fel method deh
    //1- dup test
    let duplicate = records.find(record =>  record.driverID === shiftObj.driverID && record.date === shiftObj.date);
     if (duplicate) {
        return {}; 
    }

    //2-new record calculations: and creation:
    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let metQuotaResult = metQuota(shiftObj.date, activeTime);

    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: metQuotaResult,
        hasBonus: false 
    };

    //3- finally write back to the file:
    // keep in mind the id go 1001 ,1002, 1003 so we need to find wjere to put the new record
    // where to put?
    let insertIndex = records.length; // default to end

    const driverRecords = records.filter(r => r.driverID === shiftObj.driverID); //get those with same ids
    if (driverRecords.length > 0) { // id already there
        const lastDriverIndex = records.lastIndexOf(driverRecords[driverRecords.length - 1]); //find last
        insertIndex = lastDriverIndex + 1; // and thats your target index
    }
    //now lets put it:
    records.splice(insertIndex, 0, newRecord); // also plays as a push to the end if the index is the end
    //Take our array and make it back into csv string 
    // Start with headers as first line
    const newLines = [headers.join(',')];  // "DriverID,DriverName,Date,..."

    // Add each record as a line
    records.forEach(record => {
        // Create array of values in the SAME ORDER as headers
        // This ensures columns match even with lowercase keys
        const valuesInOrder = headers.map(header => {
            const key = header.charAt(0).toLowerCase() + header.slice(1); // Convert header to match our lowercase keys
            return record[key];
        });
        // .join(',') combines them with commas
        newLines.push(valuesInOrder.join(','));
    });

    // newLines is now an array of strings:
    // Joins all lines with newline characters and writes to file
    fs.writeFileSync(textFile, newLines.join('\n'), 'utf8');


    //4-
    return newRecord;

}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // Read same as 5
    const data = fs.readFileSync(textFile, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // simpler way (badal el reduce 3a4an wasnt working)
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
            record[key] = values[j];
        }
        records.push(record);
    }

    // Find and update target record
    const targetIndex = records.findIndex(record => 
        record.driverID === driverID && record.date === date
    );
    // if founf change record
    if (targetIndex !== -1) {
        records[targetIndex].hasBonus = String(newValue);

        // Write back to file, same way
        const newLines = [headers.join(',')];
        records.forEach(record => {
            const valuesInOrder = headers.map(header => {
                const key = header.charAt(0).toLowerCase() + header.slice(1);
                return record[key];
            });
            newLines.push(valuesInOrder.join(','));
        });
        
        fs.writeFileSync(textFile, newLines.join('\n'), 'utf8');
    }
}


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
        // Read same as 5
    const data = fs.readFileSync(textFile, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // simpler way (badal el reduce 3a4an wasnt working)
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
            record[key] = values[j];
        }
        records.push(record);
    }

    // Convert month parameter to number
    const monthNum = parseInt(month, 10);
    //counter 
    let count = 0;
    //flag
    let driverExists = false;

    records.forEach(record => {
        if (record.driverID==driverID){
            driverExists = true;
            // get moth from date 
            const recordMonth = parseInt(record.date.split('-')[1], 10);

            if(recordMonth == monthNum && record.hasBonus =='true'){
                count++
            }
        }

    });

    if(!driverExists){
        return -1;
    }

    return count;

}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const data = fs.readFileSync(textFile, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
 
        // simpler way (badal el reduce 3a4an wasnt working)
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
            record[key] = values[j];
        }
        records.push(record);
    }

    // Convert month parameter to number
    const monthNum = parseInt(month, 10);
    //he total active time to acc on in each iter
    let totalS = 0;

    records.forEach(record => {
        const recordMonth = parseInt(record.date.split('-')[1], 10);
        if (record.driverID == driverID && recordMonth == monthNum) {
            // Extract activeTime and convert to seconds
            const activeSeconds = timeToSeconds(record.activeTime);
            totalS += activeSeconds;
        }
    });

    return secondsToTime(totalS);
    
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // from understanding its required hours in days they DID work in , hehe cute 
    // reading days off
    const rateData = fs.readFileSync(rateFile, 'utf8');
    const rateRows = rateData.split('\n').filter(row => row.trim() !== '');
    let dayOff = null;
    
    for (let i = 0; i < rateRows.length; i++) {
        const values = rateRows[i].split(',');
        if (values[0] === driverID) { // the id
            dayOff = values[1]; // Index 1 is dayOff becayse we got no headersss
            break;
        }
    }
    // no valid driver id ? no hourss :)
    if (!dayOff) {
        return "0:00:00";
    }

    // next read the shifts files to know what day that driver worked :)
    // samw way copied from fun 8
    const data = fs.readFileSync(textFile, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
            record[key] = values[j];
        }
        records.push(record);
    }
    // Convert month parameter to number
    const monthNum = parseInt(month, 10);//just incasee da5al ka string

    // create an array to see which days they actually worked with full date
    const workedDates = [];

    records.forEach(record => {
        if (record.driverID === driverID) {
            const [year, recordMonth, day] = record.date.split('-').map(Number);
            if (recordMonth === monthNum) {
                workedDates.push(record.date); // Store full date string
            }
        }
    });

    // Then filter out day off
    const validDates = workedDates.filter(date => {
        const dayOfWeek = getDayOfWeek(date);
        return dayOfWeek !== dayOff;
    });

    //now we have a clean filtered array with worked dates - days off
    //lets calculate total time for each of those days keeping in mind eid condition
    let totalSeconds = 0;
    validDates.forEach(date => {
        // Check if this date is during Eid (April 10-30, 2025)
        if (date >= "2025-04-10" && date <= "2025-04-30") {
            totalSeconds += 6 * 3600; // Eid= 6 hours
        } else {
            totalSeconds += (8 * 3600) + (24 * 60); // Normal = 8 hours 24 minutes
        }
    });

    //nextw we check the bonus condition
    const bonusDeduction = bonusCount * 2 * 3600;
    totalSeconds = Math.max(0, totalSeconds - bonusDeduction); // Ensure non-negative ,just in case

    return secondsToTime(totalSeconds);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    const rateData = fs.readFileSync(rateFile, 'utf8');
    const rateRows = rateData.split('\n').filter(row => row.trim() !== '');
    let tier;
    let basePay;

    for (let i = 0; i < rateRows.length; i++){
        const values = rateRows[i].split(',');
        if (values[0] === driverID){
            tier = parseInt(values[3], 10);     // Convert to number from string
            basePay = parseInt(values[2], 10);  // Convert to number
            break;
        }

    }

    //if driver id not present
    if (!basePay) {
    return 0; 
    }

    const requiredSeconds = timeToSeconds(requiredHours);
    const actualSeconds = timeToSeconds(actualHours);
    let missingSeconds = requiredSeconds - actualSeconds;

    if (missingSeconds <= 0) {
        return basePay; // we dont need to copute anything else
    }


    let allowedSeconds = 0;
    switch(tier) {
        case 1: allowedSeconds = 50 * 3600; break;  // Senior: 50 hours
        case 2: allowedSeconds = 20 * 3600; break;  // Regular: 20 hours
        case 3: allowedSeconds = 10 * 3600; break;  // Junior: 10 hours
        case 4: allowedSeconds = 3 * 3600; break;   // Trainee: 3 hours
        default: allowedSeconds = 0;
    }

    let netSeconds = Math.max(0, missingSeconds - allowedSeconds);

    // If no seconds after allowance, return full base pay again
    if (netSeconds === 0) {
        return basePay;
    }

    const netHours = Math.floor(netSeconds / 3600);
    
    // Calculate deduction rate and final pay
    const deductionRate = Math.floor(basePay / 185);
    const salaryDeduction = netHours * deductionRate;
    const netPay = basePay - salaryDeduction;
    
    return netPay;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
