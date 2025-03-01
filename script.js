// Store the courses
let courses = [];

let language = "en";

document.addEventListener("DOMContentLoaded", () => {
	tippy("#totalHours", {
		content:
			"Da lw 3ayz tehseb elGPA w mkasel tektb kool elmawad, Ektb your total hours.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#currentGPA", {
		content: "Ekteb baa elGPA bta3k now.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#courseNaming", {
		content: "Optional: Enter the course name.",
		trigger: "mouseenter focus",
		touch: true,
	});
	tippy("#calcCumulativce", {
		content:
			"Adds your current GPA as a Course so you can predict your GPA and play around. ",
		trigger: "mouseenter focus",
		touch: true,
	});
	tippy("#gradeLabel", {
		content: "Select the grade you received for the course.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#creditLabel", {
		content: "Choose the credit hours for this course.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#addCourseLabel", {
		content: "Click to add the course to your GPA calculation.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#clearAll", {
		content: "Click to remove all courses from the list.",
		trigger: "mouseenter focus",
		touch: true,
	});

	tippy("#toggleDarkMode", {
		content: "Toggle between dark and light mode.",
		trigger: "mouseenter focus",
		touch: true,
	});
});

// Function to change the language
function changeLanguage(lang) {
	language = lang;
	applyTranslations();
}

$(".close").click(function () {
	$(this).parent(".alert").fadeOut();
});

// Apply translations based on the selected language
function applyTranslations() {
	const translations = {
		en: {
			alertLabel:
				"Courses list is autosaved,\n you can close the tab and come back next term!",
			gradeLabel: "Grade:",
			creditLabel: "Credit Hours:",
			hoursLabel2: "2 Hours",
			hoursLabel3: "3 Hours",
			courseNaming: "Course Name:",
			addCourseLabel: "Add Course",
			removeCourseLabel: "Remove",
			gpaLabel: "Your GPA:",
		},
		ar: {
			alertLabel:
				"درجات المقررات بتتحفظ على جهازك\n عشان مش كل ترم تكتب كل المواد",
			gradeLabel: "الدرجة:",
			courseNaming: "اسم المقرر",
			creditLabel: "عدد الساعات:",
			hoursLabel2: "٢ ساعة",
			hoursLabel3: "٣ ساعات ",
			addCourseLabel: "أضف المادة",
			removeCourseLabel: "إزالة",
			gpaLabel: "المعدل التراكمي:",
		},
	};
	const translation = translations[language];

	// Apply translations to HTML elements
	document.getElementById("alert").innerText = translation.alertLabel;

	document.getElementById("gradeLabel").textContent = translation.gradeLabel;
	document.getElementById("courseNaming").textContent =
		translation.courseNaming;

	document.getElementById("creditLabel").textContent = translation.creditLabel;
	document.getElementById("hoursLabel2").textContent = translation.hoursLabel2;
	document.getElementById("hoursLabel3").textContent = translation.hoursLabel3;

	document.getElementById("addCourseLabel").textContent =
		translation.addCourseLabel;
	document.getElementById("gpaLabel").textContent = translation.gpaLabel;

	// Apply translations to existing course list
	const courseList = document.getElementById("courseList");
	for (let i = 0; i < courses.length; i++) {
		const listItem = courseList.children[i];
		const removeButton = listItem.querySelector(".removeButton");
		removeButton.textContent = translation.removeCourseLabel;
	}
}

// Load saved courses from local storage (if any)
if (localStorage.getItem("courses")) {
	courses = JSON.parse(localStorage.getItem("courses"));
	displayCourses();
	calculateGPA();
	applyTranslations(); // Update translations after loading saved courses
	document.getElementById("alert").parentNode.style.display = "none";
}

// Add a course to the list
function addCourse() {
	const gradeSelect = document.getElementById("grade");
	const creditInputs = document.getElementsByName("credit");
	const courseNameInput = document.getElementById("courseName");
	let credit;

	for (const creditInput of creditInputs) {
		if (creditInput.checked) {
			credit = parseInt(creditInput.value);
			break;
		}
	}

	if (isNaN(credit)) {
		alert("Please select a valid credit hour.");
		return;
	}

	const grade = gradeSelect.value;
	const courseName = courseNameInput.value || "Unnamed Course";

	courses.push({ courseName, grade, credit });
	saveCourses(); // Save courses to local storage

	// Create a new list item to display the course
	const listItem = document.createElement("li");
	listItem.textContent = `${courseName}: ${grade} (${credit} credit${
		credit === 1 ? "" : "s"
	})`;

	const removeButton = document.createElement("button");
	removeButton.classList.add("removeButton");
	removeButton.textContent = "Remove";
	removeButton.addEventListener("click", () => {
		removeCourse(listItem);
	});

	listItem.appendChild(removeButton);

	const courseList = document.getElementById("courseList");
	courseList.appendChild(listItem);

	// Clear the input fields
	gradeSelect.selectedIndex = 0;
	for (const creditInput of creditInputs) {
		creditInput.checked = false;
	}
	courseNameInput.value = "";

	// Calculate GPA
	calculateGPA();
	applyTranslations(); // Update translations after adding a course
}

// Remove a course from the list
function removeCourse(listItem) {
	const courseList = document.getElementById("courseList");
	const index = Array.from(courseList.children).indexOf(listItem);

	if (index !== -1) {
		courses.splice(index, 1);
		saveCourses(); // Save courses to local storage
		courseList.removeChild(listItem);
		calculateGPA();
		applyTranslations(); // Update translations after removing a course
	}
}

// Save the courses to local storage
function saveCourses() {
	localStorage.setItem("courses", JSON.stringify(courses));
}

// Display the saved courses on the page
function displayCourses() {
	const courseList = document.getElementById("courseList");
	courseList.innerHTML = ""; // Clear the existing list

	for (const course of courses) {
		const { courseName, grade, credit } = course;

		const listItem = document.createElement("li");
		listItem.textContent = `${courseName}: ${grade} (${credit} credit${
			credit === 1 ? "" : "s"
		})`;

		const removeButton = document.createElement("button");
		removeButton.classList.add("removeButton");
		removeButton.textContent = "Remove";
		removeButton.addEventListener("click", () => {
			removeCourse(listItem);
		});

		listItem.appendChild(removeButton);
		courseList.appendChild(listItem);
	}
}

// Calculate the GPA
function calculateGPA() {
	let totalCredits = 0;
	let totalGradePoints = 0;

	for (const course of courses) {
		const { grade, credit } = course;
		if (typeof grade == "number") {
			gradePoints = grade;
		}
		if (typeof grade == "string") {
			gradePoints = getGradePoints(grade);
		}

		totalCredits += credit;
		totalGradePoints += gradePoints * credit;
		document.getElementById("totalCrdts").textContent = totalCredits;
	}
	const gpa = (totalGradePoints / totalCredits).toFixed(2);
	document.querySelector("#gpa").textContent = gpa;
	if (document.querySelector("#gpa").textContent == "NaN") {
		document.querySelector("#gpa").textContent = "0.0";
	}
}

// convert grade to grade points
function getGradePoints(grade) {
	switch (grade) {
		case "A+":
			return 4.0;
		case "A":
			return 3.7;
		case "B+":
			return 3.3;
		case "B":
			return 3.0;
		case "C+":
			return 2.7;
		case "C":
			return 2.4;
		case "D+":
			return 2.2;
		case "D":
			return 2;
		case "F":
			return 0.0;
		default:
			return 0.0;
	}
}

// Apply translations when the page loads
applyTranslations();

// Handle Enter key press to submit the form
const form = document.querySelector(".container");
form.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		addCourse();
	}
});
document
	.getElementById("calcCumulativce")
	.addEventListener("click", function () {
		// Get the values from input fields
		let totalHours = parseInt(document.getElementById("totalHours").value) || 0;
		let currentGPA =
			parseFloat(document.getElementById("currentGPA").value) || 0.0;

		// Add the Current GPA as a course
		courses.push({
			courseName: "Current GPA",
			grade: currentGPA,
			credit: totalHours,
		});
		saveCourses(); // Save to local storage
		displayCourses(); // Display updated list
		calculateGPA(); // Recalculate GPA
		applyTranslations(); // Ensure proper language updates

		console.log(
			`Added Current GPA as a course: ${currentGPA} (${letterGrade}) with ${totalHours} credit hours.`
		);
	});

// Function to convert GPA to an approximate letter grade
function convertGPAtoGrade(gpa) {
	if (gpa >= 3.7) return "A";
	if (gpa >= 3.3) return "B+";
	if (gpa >= 3.0) return "B";
	if (gpa >= 2.7) return "C+";
	if (gpa >= 2.4) return "C";
	if (gpa >= 2.2) return "D+";
	if (gpa >= 2.0) return "D";
	return "F";
}

document.getElementById("clearAll").addEventListener("click", function () {
	courses = []; // Reset the courses array
	localStorage.removeItem("courses"); // Remove saved courses from localStorage
	document.getElementById("courseList").innerHTML = ""; // Clear displayed courses
	document.getElementById("gpa").innerText = "0.0"; // Reset GPA display
	document.getElementById("totalCrdts").innerText = "0";
});
