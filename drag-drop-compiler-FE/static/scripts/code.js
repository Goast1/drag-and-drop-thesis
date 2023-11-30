var originalNames = [];
var appendQueue = [];
var editIndex = 0;
var currentType = "";
var currentLine = 0;
var elseFlag = false;
document.addEventListener("DOMContentLoaded", function () {
  appendQueue.push(document.getElementById("drag-container"));
});

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function getChildrenRecursively(element) {
  var childElements = Array.from(element.children);
  var indicesToDelete = [];
  if (childElements.length === 2) return indicesToDelete;
  childElements.forEach((i, idx) => {
    if (idx >= 2) {
      indicesToDelete.push(i.classList[2]);
      indicesToDelete = indicesToDelete.concat(getChildrenRecursively(i));
      console.log(indicesToDelete);
    }
  });
  return indicesToDelete;
}

function drop(event) {
  event.preventDefault();
  if (!elseFlag) {
    document.getElementById("else").classList.add("else-inactive");
    document.getElementById("else").classList.remove("else-active");
  }
  var data = event.dataTransfer.getData("text");
  currentType = data;
  var element = document.getElementById(data).cloneNode(true);

  if (element.classList.contains("else-active")) {
    element.classList = [];
    console.log(element);
  }
  element.classList.remove("draggable-block");
  element.classList.remove("else-inactive");
  element.classList.add("code-block");
  element.classList.add("may-be-deleted");
  element.draggable = false;
  element.removeAttribute("ondragstart");
  element.removeAttribute("id");
  element.classList.add(data);
  element.classList.add(currentLine);

  const img = document.createElement("img");
  img.classList.add("delete-icon");
  img.src = "../images/delete.png";
  img.addEventListener("click", () => {
    event.stopPropagation();

    const index = element.classList[2];
    var indicesToDelete = getChildrenRecursively(element);

    element.remove();
    let send_indexes = indicesToDelete;
    send_indexes.push(index);
    fetch("https://drag-drop-backend.azurewebsites.net/remove_block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: get_cookie("session_id"),
        index: send_indexes,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let code_area = document.getElementById("generated-code");
        let item = Array.from(code_area.childNodes).forEach((item) => {
          if (
            item.classList[0] === index ||
            indicesToDelete.includes(item.classList[0])
          ) {
            item.remove();
          }
          if (!document.body.contains(appendQueue[appendQueue.length - 1]))
            appendQueue.pop();
        });
      });
  });
  element.insertBefore(img, element.firstChild);
  let webElementToAppendTo = appendQueue[appendQueue.length - 1];
  if (data !== "end") {
    webElementToAppendTo.appendChild(element);
    element.classList.add(currentLine++);
  }
  if (data === "loop" || data === "if" || data === "else")
    appendQueue.push(element);

  if (data === "end") {
    if (appendQueue.length > 1) {
      appendQueue.pop();
    }
    currentLine++;
  }
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (element?.parentElement?.children) {
      editIndex = Array.from(element.classList)[2];
      openPopupWindow(element.classList[1], true);
    }
  });
  openPopupWindow(data);
}

function openPopupWindow(template, edit = false, load = false, save = false) {
  var overlay = document.getElementById("overlay");
  var popupdiv = document.getElementById("popupDiv");
  originalNames = [];
  if (!save) {
    if (!load) {
      if (!edit)
        fetch(`../templates/popups/code/create/${template}.html`)
          .then((response) => response.text())
          .then((content) => {
            popupdiv.innerHTML += content;
          })
          .catch((error) => {
            console.error("Error fetching the template:", error);
          });
      else
        fetch(`../templates/popups/code/edit/${template}.html`)
          .then((response) => response.text())
          .then((content) => {
            popupdiv.innerHTML += content;
          })
          .catch((error) => {
            console.error("Error fetching the template:", error);
          });
    } else {
      fetch(`../templates/popups/code/load/${template}.html`)
        .then((response) => response.text())
        .then((content) => {
          popupdiv.innerHTML += content;
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
              const projectListElement = document.getElementById("projectList");
              data.forEach((project) => {
                const checkbox = document.createElement("input");
                checkbox.type = "radio";
                checkbox.id = project;
                checkbox.value = project;
                checkbox.name = "projects";
                checkbox.addEventListener("change", (event) => {
                  let x = document.getElementsByClassName("project--div");
                  Array.from(x).forEach((item) => {
                    item.classList.remove("active");
                  });
                  document
                    .getElementById(`project-${event.target.id}`)
                    .classList.add("active");
                });
                const label = document.createElement("label");
                label.htmlFor = project;
                label.appendChild(document.createTextNode(project));

                const container = document.createElement("div");
                container.id = `project-${project}`;
                container.classList.add("project--div");
                container.appendChild(checkbox);
                container.appendChild(label);

                projectListElement.appendChild(container);
              });
            })
            .catch((error) => {
              console.error("Error fetching projects:", error);
            });
        })
        .catch((error) => {
          console.error("Error fetching the template:", error);
        });
    }
  } else {
    fetch(`../templates/popups/code/load/save.html`)
      .then((response) => response.text())
      .then((content) => {
        popupdiv.innerHTML += content;
      })
      .catch((error) => {
        console.error("Error fetching the template:", error);
      });
  }
  overlay.style.display = "block";
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.style.display = "none";
      popupdiv.innerHTML = "";
      element = document.getElementsByClassName("may-be-deleted")[0];
      if (appendQueue.includes(element)) appendQueue.pop(element);
      if (element)
        document.getElementById("drag-container").removeChild(element);
    }
  });
}

function compile() {
  code_output = document.getElementById("compile-output");
  fetch("https://drag-drop-backend.azurewebsites.net/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: get_cookie("session_id") }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      code_output.innerHTML = data;
    });
}

function get_cookie(cookieName) {
  let cookies = document.cookie.split(";").reduce((cookieObj, cookie) => {
    const [name, value] = cookie.trim().split("=");
    cookieObj[name] = decodeURIComponent(value).replace(/^["'](.+)["']$/, "$1");
    return cookieObj;
  }, {});
  return cookies[cookieName];
}

function create_block(event) {
  formElements = event.target;
  var overlay = document.getElementById("overlay");
  overlay.style.display = "none";
  var popupdiv = document.getElementById("popupDiv");
  popupdiv.innerHTML = "";

  var form = event.target;

  const data = {
    session_id: get_cookie("session_id"),
    identifier: form.classList[0],
    code: form.elements["code"]?.value ?? "",
    var: form.elements["var"]?.value ?? "",
    val: form.elements["val"]?.value ?? "",
    valto: form.elements["valto"]?.value ?? "",
    tag: form.elements["tag"]?.value ?? "",
    seq_item: currentType,
  };
  fetch("https://drag-drop-backend.azurewebsites.net/add-block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((x) => {
      var code_output = document.getElementById("generated-code");
      code_output.innerHTML +=
        x === "" ? "" : `<div class=${currentLine - 1}></br >${x}</div>`;
    });
  element = document.getElementsByClassName("may-be-deleted")[0];
  element?.classList?.remove("may-be-deleted");

  if (["3", "4"].includes(form.classList[0])) {
    document.getElementById("else").classList.remove("else-inactive");
    document.getElementById("else").classList.add("else-active");
    elseFlag = true;
  } else if (form.classList[0] === "9") {
    document.getElementById("else").classList.remove("else-inactive");
    document.getElementById("else").classList.add("else-active");
    elseFlag = false;
  }
}

function update_block(event) {
  formElements = event.target;
  var overlay = document.getElementById("overlay");
  overlay.style.display = "none";
  var popupdiv = document.getElementById("popupDiv");
  popupdiv.innerHTML = "";

  var form = event.target;

  const data = {
    session_id: get_cookie("session_id"),
    identifier: form.classList[0],
    code: form.elements["code"]?.value ?? "",
    var: form.elements["var"]?.value ?? "",
    val: form.elements["val"]?.value ?? "",
    valto: form.elements["valto"]?.value ?? "",
    tag: form.elements["tag"]?.value ?? "",
    index: editIndex,
  };
  console.log(data);
  fetch("https://drag-drop-backend.azurewebsites.net/update_block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((x) => {
      var code_output = document.getElementById("generated-code");
      codeOutputElement = code_output.childNodes[editIndex];
      codeOutputElement.innerHTML = x === "" ? "" : `</br >${x}`;
      editIndex = -1;
    });
}

function save() {
  var saveName = document.getElementById("saveName").value;
  if (saveName.includes(" ") || saveName === "") {
    alert("Name cannot contain spaces");
    return;
  }
  fetch("https://drag-drop-backend.azurewebsites.net/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: get_cookie("user_id"),
      session_id: get_cookie("session_id"),
      file_name: saveName,
    }),
  }).then((response) => {
    response.blob();
    console.log(response);
    document.getElementById("overlay").click();
  });
}

function fetchAndDisplayProjects() {
  fetch("url-to-backend-endpoint")
    .then((response) => response.json())
    .then((data) => {
      const projectListElement = document.getElementById("projectList");
      data.projects.forEach((project) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = project.id;
        checkbox.value = project.id;
        checkbox.name = "projects";

        const label = document.createElement("label");
        label.htmlFor = project.id;
        label.appendChild(document.createTextNode(project.name));

        const container = document.createElement("div");
        container.appendChild(checkbox);
        container.appendChild(label);

        projectListElement.appendChild(container);
      });
    })
    .catch((error) => {
      console.error("Error fetching projects:", error);
    });
}

function renderBlocks(elements) {
  currentLine = 0;
  elements.forEach((item) => {
    var element = document.getElementById(item).cloneNode(true);
    element.classList.remove("draggable-block");
    element.classList.remove("else-inactive");
    element.classList.add("code-block");
    element.draggable = false;
    element.removeAttribute("ondragstart");
    element.removeAttribute("id");
    element.classList.add(item);

    const img = document.createElement("img");
    img.classList.add("delete-icon");
    img.src = "../images/delete.png";
    img.addEventListener("click", () => {
      event.stopPropagation();

      const index = element.classList[2];
      var indicesToDelete = getChildrenRecursively(element);

      let send_indexes = indicesToDelete;
      send_indexes.push(index);
      fetch("https://drag-drop-backend.azurewebsites.net/remove_block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: get_cookie("session_id"),
          index: send_indexes,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let code_area = document.getElementById("generated-code");
          let items = Array.from(code_area.childNodes).forEach((item) => {
            console.log(item);
            if (
              item.classList[0] === index ||
              indicesToDelete.includes(item.classList[0])
            ) {
              item.remove();
              element.remove();
            }
          });
        });
    });
    element.insertBefore(img, element.firstChild);
    let webElementToAppendTo = appendQueue[appendQueue.length - 1];
    if (item !== "end") {
      webElementToAppendTo.appendChild(element);
      element.classList.add(currentLine++);
    }
    if (item === "loop" || item === "if" || item === "else")
      appendQueue.push(element);
    if (item === "end") {
      appendQueue.pop();
      currentLine++;
    }
    element.addEventListener("click", () => {
      event.stopPropagation();
      if (element?.parentElement?.children) {
        editIndex = Array.from(element.classList)[2];
        openPopupWindow(element.classList[1], true);
      }
    });
  });
}

async function storeOriginalNames(div) {
  console.log(div);
  const inputElements = div.querySelectorAll("[name]");
  originalNames = Array.from(inputElements, (input) => input.name);
  console.log(originalNames);
}

async function changeNames(div) {
  await storeOriginalNames(div);
  const inputElements = div.querySelectorAll("[name]");
  inputElements.forEach((element) => {
    if (element.getAttribute("name") !== "") element.name = "";
  });
}

async function revertNames(div) {
  const inputElements = div.querySelectorAll("[name]");
  inputElements.forEach((input, index) => {
    if (input.name == "") input.name = originalNames[index];
  });
}

async function handleConditionChange(event) {
  let compareDiv = document.getElementById("compareValues");
  let singleDiv = document.getElementById("singleValueCheck");
  if (event.value == "compare") {
    await revertNames(compareDiv);
    await changeNames(singleDiv);
    compareDiv.classList.add("visible");
    singleDiv.classList.remove("visible");
  } else {
    await revertNames(singleDiv);
    await changeNames(compareDiv);
    singleDiv.classList.add("visible");
    compareDiv.classList.remove("visible");
  }
}

async function handleConditionChangeLoop(event) {
  let whileDiv = document.getElementById("while");
  let forDiv = document.getElementById("for");
  if (event.value == "while") {
    await revertNames(whileDiv);
    await changeNames(forDiv);
    document.getElementById("while").classList.add("visible");
    document.getElementById("for").classList.remove("visible");
  } else {
    await revertNames(forDiv);
    await changeNames(whileDiv);
    document.getElementById("for").classList.add("visible");
    document.getElementById("while").classList.remove("visible");
  }
}

function handleConditionChangeInnerLoop(event) {
  if (event.value === "" || event.value == "not") {
    document.getElementById("secondVal").classList.remove("visible");
  } else {
    document.getElementById("secondVal").classList.add("visible");
  }
}

function handleChangeElse(event) {
  if (event.target.checked === true) {
    document.getElementsByClassName("else-container")[0].style.display =
      "block";
  } else {
    document.getElementsByClassName("else-container")[0].style.display = "none";
  }
}

function loadSelectedProject(event) {
  let fileName = event.target;
  let activeDiv = fileName.getElementsByClassName("active")[0];
  let val = activeDiv.children[0].value;

  const data = {
    user_id: get_cookie("user_id"),
    session_id: get_cookie("session_id"),
    file_name: val,
  };
  fetch("https://drag-drop-backend.azurewebsites.net/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((x) => {
      x.code.forEach((line) => {
        var code_output = document.getElementById("generated-code");
        code_output.innerHTML +=
          x === "" ? "" : `<div class=${currentLine++}></br >${line}</div>`;
      });
      renderBlocks(x.elements);
      document.getElementById("overlay").click();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  let nameFlag = localStorage.getItem("ProjectName") ?? "";
  console.log(nameFlag);
  if (nameFlag !== "") {
    const data = {
      user_id: get_cookie("user_id"),
      session_id: get_cookie("session_id"),
      file_name: nameFlag,
    };
    fetch("https://drag-drop-backend.azurewebsites.net/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((x) => {
        x.code.forEach((line) => {
          document.getElementById(
            "generated-code"
          ).innerHTML += `<div class=${currentLine++}></br >${line}</div>`;
        });
        renderBlocks(x.elements);
        document.getElementById("overlay").click();
      });
  }
});
