import "datatables.net";

console.log("WHAT ABOUT HERE?");

$(document).ready(function() {
    console.log("WHY");
    $("#pets-table").DataTable({
        ordering: true
    });
});