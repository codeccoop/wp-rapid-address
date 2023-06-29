document.addEventListener("DOMContentLoaded", function () {
	Array.from(document.getElementsByClassName("wpra-db-form")).forEach(
		(form) => {
			bindForm(form);
		}
	);

	function bindForm(form) {
		form.addEventListener(
			"submit",
			(ev) => {
				ev.preventDefault();
				ev.stopPropagation();

				const method = form.getAttribute("method");
				switch (method) {
					case "get":
						submitGetForm();
						break;
					case "post":
						submitPostForm(form);
						break;
				}
			},
			true
		);
	}

	function submitGetForm() {
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
					anchor.download = "wpradb.json";
					document.body.appendChild(anchor);
					anchor.click();
					document.body.removeChild(anchor);
					URL.revokeObjectURL(url);
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	function submitPostForm(form) {
		// debugger;
		const data = new FormData(form);
		// data.append(
		// 	"userfile",
		// 	form.querySelector('input[type="file"]').files[0]
		// );
		data.append("action", "wpra_post_db");
		data.append("_ajax_nonce", ajaxWPRA.nonce);

		// const file = form.querySelector('input[type="file"]').files[0];
		// file.text().then((json) => {
		// 	const blob = new Blob([json], { type: "application/json" });
		// 	data.append("blob", blob);

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
			.catch((err) => {
				console.log(err);
			});
		// });
	}
});
