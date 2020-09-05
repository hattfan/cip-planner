// $(document).ready(function () {
//     $('#myTable').DataTable({});
// });
$(document).ready(function () {

    $('#myTable').DataTable({
        "ajax" : {
            "url" : "/admintabledata",
            "dataSrc" : function (json) {
                console.log(json)
            }
        }
    });

    // var table = $('#myTable').removeAttr('width').DataTable({
    //     // scrollY: "300px",
    //     scrollX: true,
    //     scrollCollapse: true,
    //     // paging: false,
    //     // columnDefs: [
    //     //     { width: 200, targets: 0 }
    //     // ],
    //     fixedColumns: true,
    // })
});