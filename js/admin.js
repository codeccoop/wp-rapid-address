document.addEventListener("DOMContentLoaded", function () {
	document.querySelectorAll(".wpra-admin-form").forEach((form) => {
		bindForm(form);
	});

	function bindForm(form) {
		form.addEventListener(
			"submit",
			(ev) => {
				ev.preventDefault();
				ev.stopPropagation();

				const method = form.getAttribute("method");
				switch (method) {
					case "get":
						submitGetForm(form);
						break;
					case "post":
						submitPostForm(form);
						break;
				}
			},
			true
		);
	}

	function submitGetForm(form) {
		form.classList.remove("ajax-error");
		let exportName =
			form.querySelector('input[type="text"]').value || "wpradb.json";

		if (!/\.json$/.test(exportName)) {
			exportName += ".json";
		}

		fetch(ajaxWPRA.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: `action=wpra_get_db&_ajax_nonce=${ajaxWPRA.nonce}`,
		})
			.then((res) => {
				if (res.status >= 300) throw new Error(res.status);
				res.blob().then((blob) => {
					const url = URL.createObjectURL(blob);
					const anchor = document.createElement("a");
					anchor.href = url;
					anchor.download = exportName;
					document.body.appendChild(anchor);
					anchor.click();
					document.body.removeChild(anchor);
					URL.revokeObjectURL(url);
				});
			})
			.catch((err) => {
				form.classList.add("ajax-error");
			});
	}

	function submitPostForm(form) {
		form.classList.remove("ajax-error");
		const data = new FormData(form);
		data.append("action", "wpra_post_db");
		data.append("_ajax_nonce", ajaxWPRA.nonce);

		fetch(ajaxWPRA.endpoint, {
			method: "POST",
			body: data,
		})
			.then((res) => {
				if (res.status >= 400) throw new Error(res.status);
				else return res.json();
			})
			.then((data) => {
				if (!data.success) throw new Error(403);
			})
			.catch(() => {
				form.classList.add("ajax-error");
			});
	}
});
