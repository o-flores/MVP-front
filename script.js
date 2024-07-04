const BASE_URL = "http://127.0.0.1:5000";
const donorsSelect = document.querySelector("#donor-select");
const donorsSelectHelperText = document.querySelector("#donor-helper-text");
const beneficiariesSelect = document.querySelector("#beneficiary-select");
const beneficiariesSelectHelperText = document.querySelector(
	"#beneficiary-helper-text"
);
const table = document.querySelector("#donations");
const beneficiaryModalEl = document.getElementById("create-beneficiary-modal");
const donorModalEl = document.getElementById("create-donor-modal");

const beneficiaryModal = new bootstrap.Modal(beneficiaryModalEl);
const donorModal = new bootstrap.Modal(donorModalEl);

const getService = async (url) => {
	return fetch(url, { method: "get" })
		.then((response) => response.json())
		.then((data) => data);
};

const addOptionsToSelect = (select, options) => {
	options.forEach((option) => {
		const item = document.createElement("option");
		item.value = option.id;
		item.innerHTML = option.name;
		select.appendChild(item);
	});
};

const insertDeleteButton = (row, id) => {
	const iconCell = row.insertCell(-1);
	iconCell.innerHTML = '<i class="bi bi-trash"></i>';
	const deleteIcon = iconCell.querySelector(".bi-trash");
	deleteIcon.style.cursor = "pointer";
	deleteIcon.addEventListener("click", () => {
		deleteRow(id);
	});
};

const clearTable = (table) => {
	while (table.rows.length > 1) {
		table.deleteRow(1);
	}
};

const addRowToTable = (table, data) => {
	const row = table.insertRow();
	const rowInfo = [
		data.donor_name,
		data.beneficiary_name,
		data.product,
		data.quantity,
	];
	for (let i = 0; i < rowInfo.length; i++) {
		const cell = row.insertCell(i);
		cell.innerText = rowInfo[i];
	}
	insertDeleteButton(row, data.id);
};

const clearSelect = (select) => {
	while (select.options.length > 1) {
		select.remove(1);
	}
};

const updateSelect = (select, options) => {
	clearSelect(select);
	addOptionsToSelect(select, options);
};

const updateTable = async () => {
	clearTable(table);
	const donations = await getService(`${BASE_URL}/donations`);
	donations.forEach((donation) => addRowToTable(table, donation));
};

const addDonation = async (e) => {
	e.preventDefault();
	const formData = new FormData(e.target);
	const formProps = Object.fromEntries(formData.entries());

	try {
		await fetch(`${BASE_URL}/donation`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formProps),
		});
		e.target.reset();
		await updateTable();
	} catch (error) {
		console.error("Error:", error);
	}
};

const addDonor = async (e) => {
	e.preventDefault();

	const formData = new FormData(e.target);
	const formProps = Object.fromEntries(formData.entries());

	try {
		const response = await fetch(`${BASE_URL}/donor`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formProps),
		});

		const data = await response.json();

		if (response.ok) {
			const donors = await getService(`${BASE_URL}/donors`);
			updateSelect(donorsSelect, donors);
			donorModal.hide();
			donorsSelectHelperText.classList.add("hide");
			e.target.reset();
		} else {
			console.error("Error:", data.message);
			donorsSelectHelperText.innerHTML = data.message;
			donorsSelectHelperText.classList.remove("hide");
		}
	} catch (error) {
		console.error("Error:", error);
	}
};

const addBeneficiary = async (e) => {
	e.preventDefault();

	const formData = new FormData(e.target);
	const formProps = Object.fromEntries(formData.entries());

	try {
		const response = await fetch(`${BASE_URL}/beneficiary`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formProps),
		});

		const data = await response.json();

		if (response.ok) {
			const beneficiaries = await getService(`${BASE_URL}/beneficiaries`);
			updateSelect(beneficiariesSelect, beneficiaries);
			beneficiaryModal.hide();
			beneficiariesSelectHelperText.classList.add("hide");
			e.target.reset();
		} else {
			console.error("Error:", data.message);
			beneficiariesSelectHelperText.innerHTML = data.message;
			beneficiariesSelectHelperText.classList.remove("hide");
		}
	} catch (error) {
		console.error("Error:", error);
	}
};

const addOnSubmit = (formSelector, onSubmit) => {
	const form = document.getElementById(formSelector);
	form.onsubmit = onSubmit;
};

const deleteRow = async (id) => {
	try {
		const response = await fetch(`${BASE_URL}/donations`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id,
			}),
		});
		await response.json();
		await updateTable();
	} catch (error) {
		console.error("Error:", error);
	}
};

const getInitialData = async () => {
	const donors = await getService(`${BASE_URL}/donors`);
	const beneficiaries = await getService(`${BASE_URL}/beneficiaries`);

	updateSelect(donorsSelect, donors);
	updateSelect(beneficiariesSelect, beneficiaries);

	updateTable();
};

beneficiaryModalEl.addEventListener("hidden.bs.modal", (e) => {
	beneficiariesSelectHelperText.classList.add("hide");
	e.currentTarget.querySelector("form").reset();
});

donorModalEl.addEventListener("hidden.bs.modal", (e) => {
	donorsSelectHelperText.classList.add("hide");
	e.currentTarget.querySelector("form").reset();
});

const onLoad = async () => {
	await getInitialData();
	addOnSubmit("donation-form", addDonation);
	addOnSubmit("donor-form", addDonor);
	addOnSubmit("beneficiary-form", addBeneficiary);
};

window.onload = onLoad();
