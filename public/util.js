
// shows and hides html elements
exports.toggleElements = (show = [], hide = []) => {
  for (let i in show) {
    document.getElementById(show[i]).style.display = "block";
  }
  for (let i in hide) {
    document.getElementById(hide[i]).style.display = "none";
  }
}

// logs stuff with slick style... IDK where I was going with this tbh
exports.log = (data) => {
  console.log(data);
}