const projectsLink = document.getElementById("projects-link");
const projectsDropdown = document.getElementById("projects-dropdown");
let timeoutId;

projectsLink.addEventListener("mouseover", () => {
    clearTimeout(timeoutId);
    projectsDropdown.style.display = "block";

});

projectsLink.addEventListener("mouseout", () => {
    timeoutId = setTimeout(() => {
        projectsDropdown.style.display = "none";
        
    }, 500);
});

projectsDropdown.addEventListener("mouseover", () => {
    clearTimeout(timeoutId);
});

projectsDropdown.addEventListener("mouseout", (event) => {
    if (!event.toElement ||!projectsDropdown.contains(event.toElement)) {
        timeoutId = setTimeout(() => {
            projectsDropdown.style.display = "none";
        }, 500);
    }
});

const dropdownLinks = projectsDropdown.getElementsByTagName("a");

for (let i = 0; i < dropdownLinks.length; i++) {
    dropdownLinks[i].addEventListener("mouseover", () => {
        clearTimeout(timeoutId);
    });

    dropdownLinks[i].addEventListener("mouseout", (event) => {
        if (!event.toElement ||!projectsDropdown.contains(event.toElement)) {
            timeoutId = setTimeout(() => {
                projectsDropdown.style.display = "none";
            }, 500);
        }
    });
}

// document.querySelectorAll('.image-container img').forEach(image =>{
//     image.onclick = () =>{
//         document.querySelector('.popup-image').style.display='block';
//         document.querySelector('.popup-image img').src = image.getAttribute('src');
//     }
// });
// document.querySelector('.popup-image span').onclick = ()=>{
//     document.querySelector('.popup-image').style.display='none';
// }


// toggle icon navbar


let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('active');
    navbar.classList.toggle('active');
});
document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
document.getElementById("myElement").addEventListener("contextmenu", function(event) {
    event.preventDefault();
});