var username = null;
var password = null;
var passwordDupe = null;
var userValid = false;
var passValid = false;
var dupeValid = false;

function get_cookie(cookieName) {
  let cookies = document.cookie.split(";").reduce((cookieObj, cookie) => {
    const [name, value] = cookie.trim().split("=");
    cookieObj[name] = decodeURIComponent(value).replace(/^["'](.+)["']$/, "$1");
    return cookieObj;
  }, {});
  return cookies[cookieName];
}

document.addEventListener("DOMContentLoaded", (event) => {
  const newCode = document.querySelector('a[href="./pages/code.html#new"]');
  newCode?.addEventListener("click", () => {
    localStorage.setItem("ProjectName", "");
  });
  const code = document.querySelector('a[href="./pages/code.html"]');
  if (get_cookie("user_id")) {
    const loginItem = document.querySelector('a[href="#login"]');
    const registerItem = document.querySelector('a[href="#register"]');
    if (loginItem) {
      loginItem.textContent = "Sign-out";
      loginItem.href = "#";
      loginItem.onclick = function () {
        signOutUser();
      };

      if (registerItem) {
        registerItem.hidden = true;
      }
    }
  } else {
    code.addEventListener("click", (e) => {
      e.preventDefault();
      const htmlElement =
        document.getElementsByClassName("prompt").length ||
        document.createElement("div");
      if (htmlElement != 1) {
        htmlElement.classList.add("prompt");
        htmlElement.innerHTML = "Login / register to start coding.";
        code.parentElement.parentElement.appendChild(htmlElement);
        setTimeout(() => {
          htmlElement.remove();
        }, 1000);
      }
    });
    code.href = "";
    newCode.addEventListener("click", (e) => {
      e.preventDefault();
      const htmlElement =
        document.getElementsByClassName("prompt").length ||
        document.createElement("div");
      if (htmlElement != 1) {
        htmlElement.classList.add("prompt");
        htmlElement.innerHTML = "Login / register to start coding.";
        newCode.parentElement.parentElement.appendChild(htmlElement);
        setTimeout(() => {
          htmlElement.remove();
        }, 1000);
      }
    });
    newCode.href = "";
  }
});

function signOutUser() {
  clearCookie("user_id");
  window.location.href = "../index.html";
}

function clearCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

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

function openPopupWindowLogin(template) {
  var overlay = document.getElementById("overlay");
  var popupdiv = document.getElementById("popupDiv");
  originalNames = [];
  fetch(
    document.getElementsByClassName("swiper-wrapper").length
      ? `./templates/popups/general/${template}.html`
      : `../templates/popups/general/${template}.html`
  )
    .then((response) => response.text())
    .then((content) => {
      popupdiv.innerHTML += content;
      username = document.getElementById("username");
      password = document.getElementById("password");
      passwordDupe = document.getElementById("passwordDupe");
      validateField();
    })
    .catch((error) => {
      console.error("Error fetching the template:", error);
    });
  overlay.style.display = "block";
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.style.display = "none";
      popupdiv.innerHTML = "";
      usernameField = null;
      passwordField = null;
      passwordDupe = null;
    }
  });
}

function validateField() {
  username.addEventListener("change", (event) => {
    if (event.target.value.length <= 5) {
      let errorDiv = `<div id="user_error" class="error-div"><p>Username must be atleast 6 characters</p></div>`;
      username.insertAdjacentHTML("afterend", errorDiv);
      userValid = false;
    } else {
      let error = document.getElementById("user_error");
      if (error) error.parentNode.removeChild(error);
      userValid = true;
    }
  });
  password.addEventListener("change", (event) => {
    if (event.target.value.length <= 5) {
      let errorDiv = `<div id="pass_error" class="error-div"><p>Password must be atleast 6 characters<p></div>`;
      password.insertAdjacentHTML("afterend", errorDiv);
      passValid = false;
    } else {
      let error = document.getElementById("pass_error");
      if (error) error.parentNode.removeChild(error);
      passValid = true;
      error = document.getElementById("dupe_error");
      if (error) {
        error.parentNode.removeChild(error);
        dupeValid = true;
      }
    }
  });
  if (passwordDupe)
    passwordDupe.addEventListener("change", (event) => {
      if (event.target.value !== password.value) {
        console.log(event.target.value.length, password.value);
        let errorDiv = `<div id="dupe_error" class="error-div"><p>Passwords dont match<p></div>`;
        passwordDupe.insertAdjacentHTML("afterend", errorDiv);
        dupeValid = false;
      } else {
        console.log("done");
        let error = document.getElementById("dupe_error");
        if (error) error.parentNode.removeChild(error);
        dupeValid = true;
      }
    });
}

function submitLogin() {
  const loginData = {
    username: username.value,
    password: password.value,
  };
  if (userValid && passValid)
    fetch("https://drag-drop-backend.azurewebsites.net/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }).then((response) => {
      if (!response.ok) {
        document.getElementById("loginfailed").style.display = "block";
      }
      response.json().then((data) => {
        setCookie("user_id", data.user_id, 30);
        document.getElementById("overlay").click();
        location.reload();
      });
    });
}

function submitRegister() {
  const registerData = {
    username: username.value,
    password: password.value,
  };
  if (userValid && passValid && dupeValid)
    fetch("https://drag-drop-backend.azurewebsites.net/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        var overlay = document.getElementById("overlay");
        var popupdiv = document.getElementById("popupDiv");
        overlay.style.display = "none";
        popupdiv.innerHTML = "";
        openPopupWindowLogin("login");
        popupdiv.innerHTML +=
          '<p style="color: white">Register successful! Please login</p>';
      }
      return response.json();
    });
}
