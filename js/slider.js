function trocaCab() {
    removeCab();
    navTroca(cab);
    $("#div_" + cab).fadeIn('slow');
    cab++;
    if (cab > $(".cntimg").length)
    {
        cab = 1
    }
}

function removeCab() {
    $(".cntimg").fadeOut('slow')
}

function navTroca(x) {
    $(".navs").removeClass('nav_on');
    $(".navs").addClass('nav_off');
    $("#nav" + x).removeClass('nav_off');
    $("#nav" + x).addClass('nav_on')
}

function navAtiva(x) {
    navTroca(x); cab = x;
    trocaCab(x);
    clearInterval(intervalo);
    intervalo = setInterval("trocaCab();", 7000)
}

function printNavs() {
    var i = 1; $('.cntimg').each(function (index) {
        if (i == 1) st = "on";
        else st = "off";
        document.write("<div id=\"nav" + i + "\" class=\"navs nav_" + st + "\" onclick=\"navAtiva('" + i + "');\"></div>");
        i++
    })
}

function voltaCab() {
    intervalo = setInterval(7000)
    if (cab == 2) {
        cab = $(".cntimg").length;
    }
    else if (cab == 1) {
        cab = ($(".cntimg").length) - 1;
    }
    else {
        cab -= 2;
    }
    trocaCab();
}

function avancaCab() {
    intervalo = setInterval(7000)
    trocaCab();
}