function getCurrentDate() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    const currentDate = new Date();
    const month = months[currentDate.getMonth()];
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
  
    return `${month} ${day}, ${year}`;
  }


  function getCurrentTime() {
    const currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If the hour is 0, make it 12
  
    // Ensure minutes are always two digits
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${hours}:${minutes} ${ampm}`;
  }

  module.exports = {getCurrentDate, getCurrentTime}