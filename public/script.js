const tableBody = document.getElementById("table");
const addForm = document.getElementById("form");
const txtin = document.getElementById("txtin");

function append(row) {
  const tr = tableBody.insertRow();
  const idc = tr.insertCell();
  idc.textContent = row.id;
  const txcl = tr.insertCell();
  txcl.textContent = row.text;
  const tmc = tr.insertCell();
  tmc.textContent = row.time;
}
async function add() {
  const response = await fetch("/api/table");
  const results = await response.json();
  results.forEach(append);
}
addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const txtv = txtin.value.trim();
  if (!txtv) return;
  const response = await fetch("/api/table", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: txtv }),
  });
  if (response.ok) {
    const nr = await response.json();
    append(nr);
    txtin.value = "";
  }
});
add();