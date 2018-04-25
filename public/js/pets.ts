import "datatables.net";

$(document).ready(function() {
    $("#pets-table").DataTable({
        paging: true,
        pageLength: 2
    });
});