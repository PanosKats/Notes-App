const newNote = document.querySelector(".note-app__new-note"),
	noteContainer = document.querySelector(".note-app__container");

function formPopup(title, desc, state) {
	return `<div class="form form-bg">
			<div class="form__container">
				<div class="form__header">
					<h2>${state === "add" ? "add new note" : "update note"}</h2>
					<div class="form__close" onclick='closePopup()'>
						<i class="fa-solid fa-xmark"></i>
					</div>

				</div>
				<div class="form__group">
					<label for="title" class="form__label">title</label>
					<input type="text" id="title" class="form__field" value="${title}">
				</div>
				<div class="form__group">
					<label for="description" class="form__label">description</label>
					<textarea id="description" rows="6" class="form__field">${desc}</textarea>
				</div>
				<button class="form__submit" data-state ='${state}'>${state} note</button>
			</div>
		</div>`;
}

function noteComponent(id, title, desc, date) {
	return `<div class="note-app__note-item" data-id='${id}'>
	<div class="note-app__note-item__title">
		<h1>${title}</h1>
	</div>
	<div class="note-app__note-item__description">
		<p>${desc}</p>
	</div>
	<div class="note-app__note-item__edit">
		<div class="note-app__note-item__edit__date">${date}</div>
		<div class="note-app__note-item__edit__icon" onclick="this.classList.toggle('show-popup')">
			<button><i class="fa-solid fa-ellipsis-vertical"></i></button>
			<div class="note-app__note-item__edit__popup">
				<ul class="note-app__note-item__edit__popup__list">
					<li class="note-app__note-item__edit__popup__list-item" onclick="updateNote(${id}, '${title}', '${desc}')">
						<i class="fa-solid fa-pen-to-square"></i>
						<p>edit</p>
					</li>
					<li class="note-app__note-item__edit__popup__list-item" onclick="deleteNote(${id})">
						<i class="fa-solid fa-trash"></i>
						<p>delete</p>
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>`;
}

function closePopup() {
	document.querySelector(".form-bg").style.animation = "popdown 0.2s forwards";
	document.querySelector(".form-bg").addEventListener("animationend", () => {
		document.querySelector(".form-bg").remove();
	});
}

function getFromLocalSt() {
	return Array.from(JSON.parse(localStorage.getItem("notes")) || []);
}

function setIntoLocalSt(notes) {
	localStorage.setItem("notes", JSON.stringify(notes));
}

function addNewNote() {
	document.body.insertAdjacentHTML("beforeend", formPopup("title", "description", "add"));
	const addBtn = document.querySelector(".form__submit[data-state=add]"),
		title = document.querySelector("#title"),
		desc = document.querySelector("#description");
	let notes = getFromLocalSt();
	addBtn.addEventListener("click", () => {
		let note = {
			id: new Date().getTime(),
			title: title.value,
			desc: desc.value,
			date: new Date().toLocaleString().split(",")[0],
		};
		notes.push(note);
		setIntoLocalSt(notes);
		renderNote();
		closePopup();
	});
}

function updateNote(id, ttl, desc) {
	document.body.insertAdjacentHTML("beforeend", formPopup(ttl, desc, "update"));
	const updateBtn = document.querySelector(".form__submit[data-state=update]"),
		title = document.querySelector("#title"),
		description = document.querySelector("#description");
	let notes = getFromLocalSt();
	updateBtn.addEventListener("click", () => {
		notes.forEach((note) => {
			if (note.id === id) {
				note.title = title.value;
				note.desc = description.value;
				setIntoLocalSt(notes);
				renderNote();
				closePopup();
			}
		});
	});
}

function deleteNote(id) {
	if(confirm("Are you sure you want to delete note?")){
		let notes = getFromLocalSt();
		notes.forEach((note, index) => {
			if(note.id === id){
				notes.splice(index, 1);
				setIntoLocalSt(notes);
				renderNote();
			}
		});
	}
}

function renderNote() {
	document.querySelectorAll(".note-app__note-item").forEach((note) => note.remove());
	getFromLocalSt().forEach((note) => {
		const { id, title, desc, date } = note;
		noteContainer.insertAdjacentHTML("afterbegin", noteComponent(id, title, desc, date));
	});
}

// Export Notes as JSON File
function exportNotes() {
	const notes = getFromLocalSt();
	const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "notes.json";
	a.click();
	URL.revokeObjectURL(url);
}

// Import Notes from JSON File
function importNotes(event) {
	const file = event.target.files[0];
	if (file && file.type === "application/json") {
		const reader = new FileReader();
		reader.onload = function (e) {
			const notes = JSON.parse(e.target.result);
			setIntoLocalSt(notes);
			renderNote();
		};
		reader.readAsText(file);
	} else {
		alert("Please upload a valid JSON file.");
	}
}

// Add Export and Import Buttons
const controlsContainer = document.createElement("div");
controlsContainer.style.display = "flex";
controlsContainer.style.justifyContent = "space-between";
controlsContainer.style.padding = "1rem";
controlsContainer.style.gap = "1rem";

const exportButton = document.createElement("button");
exportButton.textContent = "Export Notes";
exportButton.className = "form__submit";
exportButton.style.backgroundColor = "white";
exportButton.style.color = "var(--blue-65)";
exportButton.style.border = "1px solid var(--blue-65)";
exportButton.onclick = exportNotes;

const importInput = document.createElement("input");
importInput.type = "file";
importInput.accept = "application/json";
importInput.style.display = "none";
importInput.onchange = importNotes;

const importLabel = document.createElement("label");
importLabel.textContent = "Import Notes";
importLabel.className = "form__submit";
importLabel.style.backgroundColor = "white";
importLabel.style.color = "var(--blue-65)";
importLabel.style.border = "1px solid var(--blue-65)";
importLabel.style.textAlign = "center";
importLabel.style.cursor = "pointer";
importLabel.style.margin = "0";
importLabel.appendChild(importInput);

controlsContainer.appendChild(exportButton);
controlsContainer.appendChild(importLabel);
document.body.insertBefore(controlsContainer, document.body.firstChild);

newNote.addEventListener("click", () => addNewNote());

window.addEventListener("load", () => renderNote());