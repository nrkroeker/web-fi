$(document).ready(function () {
    $("tr.pet-row").on("click", function () {
        console.log($(this));
        const petId = $(this).data("id");
        console.log(petId);
        if (petId) {
            window.location.href = "/pets/profile?petId=" + petId;
        }
    });
});
