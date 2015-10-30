$(document).ready(function () {
    cab = 2;
    $("#div_1").fadeIn('slow');
    intervalo = setInterval("trocaCab();", 7000);

    $('#box-conteudo-f-1').show();
    $('#menu_p_1').addClass('port-selec');

    $('.menu-port').click(function () {        
        var id = $(this).attr("id");
        id = id.split("menu_p_")[1];


        $('.conteudo-forcas').hide();
        $('.menu-port').removeClass('port-selec');
        $('#menu_p_' + id).addClass('port-selec');
        $('#box-conteudo-f-' + id).show('blind', { direction: 'left' }, 500);
    });
});