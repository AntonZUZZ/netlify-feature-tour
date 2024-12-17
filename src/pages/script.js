let gridWidth = 10;
let gridHeight = 10;
const mapDiv = document.getElementById('map');
const cellTypeSelector = document.getElementById('cellType');
const symbolInput = document.getElementById('symbolInput');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const fileInput = document.getElementById('fileInput');
const addRowButton = document.getElementById('addRowButton');
const addColButton = document.getElementById('addColButton');
const addRowStartButton = document.getElementById('addRowStartButton');
const addColStartButton = document.getElementById('addColStartButton');
const editModeButton = document.getElementById('editModeButton');
const viewModeButton = document.getElementById('viewModeButton');
const controls = document.getElementById('controls');

const tooltipForm = document.getElementById('tooltipForm');
const tooltipInput = document.getElementById('tooltipInput');
const cancelButton = document.getElementById('cancelButton');
const tooltipEditor = document.getElementById('tooltipEditor');
const customTooltip = document.getElementById('customTooltip');

let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill({ type: "empty", symbol: "", tooltip: "" }));
let editMode = "terrain"; // Modes: "terrain" or "description" or "feature"

let selectedCell = null; // Хранит текущую выбранную клетку

mapDiv.addEventListener('mousemove', (event) => {
    if (!customTooltip.classList.contains('hidden')) {
        customTooltip.style.left = `${event.pageX + 10}px`;
        customTooltip.style.top = `${event.pageY + 10}px`;
    }
});

function renderGrid() {
    let html = '<table>';
    for (let row = 0; row < gridHeight; row++) {
        html += '<tr>';
        for (let col = 0; col < gridWidth; col++) {
            const cell = grid[row][col];
            html += `<td data-type="${cell.type}" data-row="${row}" data-col="${col}" title="${cell.tooltip}">`;
            html += `<span>${cell.symbol}</span>`;
            html += `</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    mapDiv.innerHTML = html;

    mapDiv.querySelectorAll('td').forEach(cell => {
        cell.addEventListener('click', () => {
            const row = parseInt(cell.dataset.row, 10);
            const col = parseInt(cell.dataset.col, 10);

            // Обработчик наведения
            cell.addEventListener('mouseover', (event) => {
                const tooltipText = grid[row][col].tooltip || "";
                showTooltip(event, tooltipText);
            });

            // Обработчик ухода курсора
            cell.addEventListener('mouseout', () => {
                hideTooltip();
            });

            if (editMode === "terrain") {
                const terrain = cellTypeSelector.value;
                grid[row][col] = { ...grid[row][col], type: terrain };
            } else if (editMode === "description") {
                openTooltipForm(row, col); // Открыть форму для редактирования описания
            } else if (editMode === "feature") {
                const feature = featureSelect.value;
                grid[row][col] = { ...grid[row][col], symbol: feature };
            }

            renderGrid(); // Перерисовать сетку
        });
    });
}

function showTooltip(event, text) {
    if (!text) return; // Не показывать, если текста нет
    customTooltip.textContent = text;
    customTooltip.style.left = `${event.pageX + 10}px`;
    customTooltip.style.top = `${event.pageY + 10}px`;
    customTooltip.classList.remove('hidden');
}

function hideTooltip() {
    customTooltip.classList.add('hidden');
}

// Открыть форму для редактирования
function openTooltipForm(row, col) {
    selectedCell = { row, col }; // Сохраняем координаты выбранной клетки
    tooltipInput.value = grid[row][col].tooltip || ""; // Загружаем текущее описание
    tooltipForm.classList.remove('hidden'); // Показываем форму
}

// Закрыть форму без сохранения
cancelButton.addEventListener('click', () => {
    tooltipForm.classList.add('hidden'); // Скрываем форму
});

// Сохранить изменения при отправке формы
tooltipEditor.addEventListener('submit', (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    if (selectedCell) {
        const { row, col } = selectedCell;
        grid[row][col] = { ...grid[row][col], tooltip: tooltipInput.value }; // Сохраняем описание
        selectedCell = null; // Очищаем выбранную клетку
    }

    tooltipForm.classList.add('hidden'); // Скрываем форму
    renderGrid(); // Перерисовываем сетку
});

editModeButton.addEventListener('click', () => {
    if (editMode === "terrain") {
        editMode = "description";
        editModeButton.textContent = "Switch to Feature Mode";
    } else if (editMode === "description") {
        editMode = "feature";
        editModeButton.textContent = "Switch to Terrain Mode";
    } else {
        editMode = "terrain";
        editModeButton.textContent = "Switch to Description Mode";
    }
});

viewModeButton.addEventListener('click', () => {
    if (editMode !== "view") {
        editMode = "view";
        viewModeButton.textContent = "Exit View Mode";

        // Скрыть элементы управления
        controls.classList.add('hidden');
        // viewModeButton.remove('hidden');
        // legend.classList.add('hidden');
    } else {
        editMode = "terrain"; // Вернуться в режим редактирования
        viewModeButton.textContent = "Switch to View Mode";

        // Показать элементы управления
        controls.classList.remove('hidden');
        // legend.classList.remove('hidden');
    }
});


saveButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(grid)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'map.json';
    a.click();
});

loadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            grid = JSON.parse(e.target.result);
            gridHeight = grid.length;
            gridWidth = grid[0].length;
            renderGrid();
        };
        reader.readAsText(file);
    }
});

addRowButton.addEventListener('click', () => {
    grid.push(Array(gridWidth).fill({ type: "empty", symbol: "", tooltip: "" }));
    gridHeight++;
    renderGrid();
});

addRowStartButton.addEventListener('click', () => {
    grid.unshift(Array(gridWidth).fill({ type: "empty", symbol: "", tooltip: "" }));
    gridHeight++;
    renderGrid();
});

addColButton.addEventListener('click', () => {
    grid.forEach(row => row.push({ type: "empty", symbol: "", tooltip: "" }));
    gridWidth++;
    renderGrid();
});

addColStartButton.addEventListener('click', () => {
    grid.forEach(row => row.unshift({ type: "empty", symbol: "", tooltip: "" }));
    gridWidth++;
    renderGrid();
});

renderGrid();
