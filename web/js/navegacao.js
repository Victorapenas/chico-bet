// NAVEGAÇÃO ENTRE SEÇÕES (TROCA DE ABAS COM HTML SEMÂNTICO)
function configurarNavegacao() {
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchSection(target);
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-target") === sectionId);
    });

    const targetSec = document.getElementById(sectionId);
    if (targetSec) targetSec.classList.add("active");

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
