$(document).ready(function () {
    $("tr.employee-row").on("click", function () {
        const employeeId = $(this).data("id");
        if (!employeeId) {
            throw new Error("Missing employee id, tell Nathalie she messed up")
        }
        window.location.href = "/employees/profile?employeeId=" + employeeId;
    });
});
