function setCookie(cookieName, cookieValue, daysToExpire) {
  var expirationDate = new Date();
  expirationDate.setTime(
    expirationDate.getTime() + daysToExpire * 24 * 60 * 60 * 1000
  );

  var cookieString =
    cookieName +
    "=" +
    encodeURIComponent(cookieValue) +
    "; expires=" +
    expirationDate.toUTCString() +
    "; path=/";

  document.cookie = cookieString;
}

function get_cookie(cookieName) {
  let cookies = document.cookie.split(";").reduce((cookieObj, cookie) => {
    const [name, value] = cookie.trim().split("=");
    cookieObj[name] = decodeURIComponent(value);
    return cookieObj;
  }, {});
  return cookies[cookieName];
}

document.addEventListener("DOMContentLoaded", function () {
  var mySwiper = new Swiper(".swiper-container", {
    slidesPerView: "auto",
    spaceBetween: 20,
  });

  fetch("https://drag-drop-backend.azurewebsites.net//init_session")
    .then((response) => response.text())
    .then((cookie) => {
      setCookie("session_id", cookie, 1);
      const session_id = get_cookie("session_id");
      console.log("session_id:", session_id);

      if (get_cookie("user_id")) {
        fetch(
          `https://drag-drop-backend.azurewebsites.net/projects/${get_cookie(
            "user_id"
          )}`,
          {
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            const swiperContainer = document.getElementById("projects");
            const swiperWrapper =
              swiperContainer.querySelector(".swiper-wrapper");

            if (data.length > 0) {
              data.forEach((project) => {
                const swiperSlide = document.createElement("div");
                swiperSlide.classList.add("project-name");
                swiperSlide.addEventListener("click", (e) => {
                  localStorage.setItem(
                    "ProjectName",
                    e.target.innerHTML.replace(/\s+/g, "")
                  );
                  window.location.href = "./pages/code.html";
                });
                swiperSlide.classList.add("swiper-slide");
                swiperSlide.classList.add("color2");
                const projectContent = `
                  ${project}
                `;
                swiperSlide.innerHTML = projectContent;
                swiperWrapper.appendChild(swiperSlide);
              });
            } else {
              const noProjectsMessage = document.createElement("h1");
              noProjectsMessage.style.color = "black";
              noProjectsMessage.textContent =
                "You have no projects. Please create some to see them here.";
              swiperWrapper.appendChild(noProjectsMessage);
            }
          })
          .catch((error) => {
            console.error("Error fetching projects:", error);
          });
      } else {
        const swiperContainer = document.getElementById("projects");
        const swiperWrapper = swiperContainer.querySelector(".swiper-wrapper");
        const loginMessage = document.createElement("h1");
        loginMessage.style.color = "black";
        loginMessage.textContent = "Please log in to view your projects.";
        swiperWrapper.appendChild(loginMessage);
      }
    });
});
