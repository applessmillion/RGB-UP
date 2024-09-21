// Let's display some dates that make sense.
function parseDate(date_array, type=0){
    let p_day = date_array.day;
    let p_month = date_array.month;
    let p_year = date_array.year;
    
    // Look at that - we've got our [0] covered so we don't gotta do weird stuff!
    const shorthandMonth = ['null','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullhandMonth = ['null','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const numberMonth = ['null','01','02','03','04','05','06','07','08','09','10','11','12'];
    
    // YYYY-MM-DD
    if(type == 0) return p_year + `-` + numberMonth[p_month] + `-` + p_day;

    // SMo DD, YYYY
    else if(type == 1) return shorthandMonth[shorthandMonth[p_month]] + ` ` + p_day + `, ` + p_year;

    // fullhandMonth DD, YYYY
    else if(type == 2)  return fullhandMonth[p_month] + ` ` + p_day + `, ` + p_year;

    else return p_year + `-` + numberMonth[p_month] + `-` + p_day;
}