const tbl = document.getElementById("tablebody");
const form = document.getElementById("form");
const txtin = document.getElementById("textinput");
const sub = document.getElementById("submit");
function append(row) {
  const tr = tbl.insertRow();
  tr.insertCell().textContent = row.id;
  tr.insertCell().textContent = row.text;
  tr.insertCell().textContent = row.time;
}
async function adds() {
  const rp = await fetch("/api/table");
  const results = await rp.json();
  results.forEach(append);
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tv = txtin.value.trim();
  if (!tv) return;
  sub.disabled = true;
  try {
    const rp = await fetch("/api/table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: tv }),
    });
    if (rp.ok) {
      const newRow = await rp.json();
      append(newRow);
      txtin.value = "";
    } else if (rp.status === 429) {
      alert("You are posting too fast. Please wait a minute and try again.");
    } else if (rp.status === 409) {
      alert("That exact message was just posted.");
    }
  } finally {
    sub.disabled = false;
  }
});
adds();