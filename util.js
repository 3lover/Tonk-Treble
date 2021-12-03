// shows and hides html elements
function toggleElements(show = [], hide = []) {
  for (let i in show) {
    document.getElementById(show[i]).display = "block";
  }
  for (let i in hide) {
    document.getElementById(hide[i]).display = "none";
  }
}