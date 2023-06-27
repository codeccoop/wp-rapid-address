document.addEventListener("DOMContentLoaded", function () {
	const hierarchy = Array.apply(null, Array(4))
		.map((_, i) => "level_" + (i + 1))
		.concat(["zipcode"])
		.reverse();

	document.querySelectorAll("form").forEach(bindForm);

	function bindForm(form, i) {
		form.setAttribute("wpra-form", i);
		form.addEventListener("submit", validateAddress);

		bindInput(
			form,
			form.querySelector('[autocomplete="postal-code"]'),
			"zipcode"
		);

		for (let i = 1; i < 5; i++) {
			const field = "level_" + i;
			bindInput(
				form,
				form.querySelector(`[autocomplete="address-level${i}"]`),
				field
			);
		}

		initializeSuggestions(form);
	}

	function bindInput(form, input, field) {
		if (!input) return;

		const list = document.createElement("datalist");
		list.id = "wpra-" + field;
		input.insertAdjacentElement("afterend", list);
		input.setAttribute("list", list.id);
		input.setAttribute("data-field", field);

		const template =
			document.getElementById("wpra-template-" + field) ||
			document.createElement("template");
		template.id = "wpra-template-" + field;
		list.setAttribute("data-template", template.id);
		document.body.appendChild(template);

		input.addEventListener("change", (ev) => {
			const values = Array.from(list.children).map((opt) => opt.value);
			if (values.indexOf(ev.target.value) === -1) {
				ev.target.classList.add("error");
				return;
			}
			const state = wipeForm(form, field);
			getSuggestions(form).then((data) => {
				autocomplete(form, data, state);
			});
		});

		input.addEventListener("input", (ev) => {
			ev.target.classList.remove("error");
			if (
				Array.from(list.children).length !=
				Array.from(template.children).length
			) {
				const values = Array.from(template.children)
					.filter((opt) => opt.value.indexOf(ev.target.value) >= 0)
					.map((opt) => opt.value);
				updateDataList(input.getAttribute("list"), values);
			}
		});
	}

	function initializeSuggestions(form) {
		const inputs = getInputs(form);

		const query = Object.keys(inputs).reduce((query, key) => {
			query[key] = Boolean(inputs[key]);
			return query;
		}, {});
		query.action = "address_datalists";
		query._ajax_nonce = ajaxWPRA.nonce;

		fetch(ajaxWPRA.endpoint, {
			method: "POST",
			headers: {
				"Content-Type":
					"application/x-www-form-urlencoded;charset=UTF-8",
			},
			body: encodeQuery(query),
		})
			.then((res) => res.json())
			.then((data) => {
				Object.keys(data).forEach((field) => {
					const input = form.querySelector(`[data-field="${field}"`);
					const options = updateDataList(
						input.getAttribute("list"),
						data[field]
					);
					const template = document.getElementById(
						options[0].parentElement.getAttribute("data-template")
					);
					options.forEach((option) => {
						template.appendChild(option.cloneNode());
					});
				});
			});
	}

	function getSuggestions(form) {
		const inputs = getInputs(form);
		const query = Object.keys(inputs).reduce((query, key) => {
			if (inputs[key] && inputs[key].value) {
				query[key] = inputs[key].value;
			}
			return query;
		}, {});
		query.action = "address_datalists";
		query._ajax_nonce = ajaxWPRA.nonce;
		query.action = "address_suggestions";
		query._ajax_nonce = ajaxWPRA.nonce;

		return fetch(ajaxWPRA.endpoint, {
			method: "POST",
			headers: {
				"Content-Type":
					"application/x-www-form-urlencoded;charset=UTF-8",
			},
			body: encodeQuery(query),
		}).then((res) => res.json());
	}

	function wipeForm(form, field) {
		const targetBranch = hierarchy.filter((level) => level !== field);

		return targetBranch.reduce((acum, field) => {
			const input = form.querySelector(`[data-field="${field}"`);
			if (input) {
				acum[field] = input.value;
				input.value = "";
			}

			return acum;
		}, {});
	}

	function autocomplete(form, data, state) {
		const inputs = getInputs(form);

		if (inputs.zipcode) {
			const values = updateDataList(
				inputs.zipcode.getAttribute("list"),
				data.map((d) => d.zipcode)
			).map((opt) => opt.value);
			if (values.length === 1) {
				inputs.zipcode.value = values[0];
			} else if (values.indexOf(state.zipcode) >= 0) {
				inputs.zipcode.value = values[values.indexOf(state.zipcode)];
			}
		}

		for (let i = 1; i < 5; i++) {
			const field = "level_" + i;
			if (inputs[field]) {
				const values = updateDataList(
					inputs[field].getAttribute("list"),
					data.map((d) => d[field])
				).map((opt) => opt.value);
				if (values.length === 1) {
					inputs[field].value = values[0];
				} else if (values.indexOf(state[field]) >= 0) {
					inputs[field].value = values[values.indexOf(state[field])];
				}
			}
		}
	}

	function updateDataList(id, values) {
		const list = document.getElementById(id);
		list.innerHTML = "";
		new Set(values).forEach((value) => {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = value;
			list.appendChild(option);
		});
		return Array.from(list.children);
	}

	function getInputs(form) {
		const zipcode = form.querySelector('[data-field="zipcode"]');
		const level_1 = form.querySelector('[data-field="level_1"]');
		const level_2 = form.querySelector('[data-field="level_2"]');
		const level_3 = form.querySelector('[data-field="level_3"]');
		const level_4 = form.querySelector('[data-field="level_4"]');
		return { zipcode, level_1, level_2, level_3, level_4 };
	}

	function encodeQuery(query) {
		return Object.entries(query)
			.map(([k, v]) => {
				return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
			})
			.join("&");
	}

	function validateAddress(ev) {
		const inputs = getInputs(ev.target);
		const isValid = Object.keys(inputs).reduce((isValid, key) => {
			const input = inputs[key];
			if (!input) return isValid;

			if (input.value === "") {
				input.classList.add("error");
				return false;
			}

			if (input.classList.contains("error")) {
				return false;
			}

			return isValid && true;
		}, true);

		if (!isValid) {
			ev.preventDefault();
			ev.stopPropagation();
			ev.target.classList.add("validated");
		}
	}
});
