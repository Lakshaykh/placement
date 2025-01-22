// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});

// Drag-and-Drop File Upload
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = '#e9ecef';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    document.getElementById('fileInput').files = event.dataTransfer.files;
    uploadFile();
});

// Upload CSV
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file to upload.');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const rows = parseCSV(data);
            enhanceData(rows);
            displayData(rows);
        } catch (error) {
            alert('Error processing the file: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Parse CSV data
function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    return rows;
}

// Enhance Data (e.g., Adding Placement chances)
function enhanceData(rows) {
    if (rows.length === 0) return;

    const headers = rows[0];
    rows[0].push('%', 'Generate');

    for (let i = 1; i < rows.length; i++) {
        const percentage = Math.random() * 100;
        rows[i].push(percentage.toFixed(2));
        rows[i].push('<button onclick="generateReport(' + i + ')">Generate</button>');
    }
}

// Display Data in Table
function displayData(rows) {
    const dataSection = document.getElementById('data-section');
    const dataTable = document.getElementById('dataTable');
    dataTable.innerHTML = '';

    const fragment = document.createDocumentFragment();

    rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach(cell => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');
            cellElement.innerHTML = cell.trim();
            tr.appendChild(cellElement);
        });

        fragment.appendChild(tr);
    });

    dataTable.appendChild(fragment);

    dataSection.style.display = 'block';
    updateDashboard(rows);
    document.getElementById('dashboard').style.display = 'block';
}

// Update Dashboard
function updateDashboard(rows) {
    const totalRecords = rows.length - 1;
    const percentages = rows.slice(1).map(row => parseFloat(row[row.length - 2]));
    const averagePercentage = (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2);

    const placementChance = percentages.filter(percentage => percentage >= 70).length;
    const placementPercentage = ((placementChance / totalRecords) * 100).toFixed(2);

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('averagePercentage').textContent = `${averagePercentage}%`;

    // Progress bar with percentage label
    const progressBarContainer = document.getElementById('placementChance');
    progressBarContainer.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${placementPercentage}%;"></div>
        </div>
        <p>${placementPercentage}%</p>
    `;

    renderCharts(percentages);
}


// Render Charts (Bar & Pie Charts)
function renderCharts(data) {
    const ctx = document.getElementById('chart').getContext('2d');

    const ranges = [0, 20, 40, 60, 80, 100];
    const studentCounts = new Array(ranges.length - 1).fill(0);

    data.forEach(percentage => {
        for (let i = 0; i < ranges.length - 1; i++) {
            if (percentage >= ranges[i] && percentage < ranges[i + 1]) {
                studentCounts[i]++;
                break;
            }
        }
    });

    // Bar Chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges.slice(0, ranges.length - 1).map((range, index) => `${range}% - ${ranges[index + 1]}%`),
            datasets: [{
                label: 'Number of Students',
                data: studentCounts,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: '#007BFF',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1500
            },
            scales: {
                x: { title: { display: true, text: 'Percentage Range' } },
                y: { title: { display: true, text: 'Number of Students' }, beginAtZero: true }
            }
        }
    });

    // Pie Chart
    // new Chart(pieCtx, {
    //     type: 'pie',
    //     data: {
    //         labels: ranges.slice(0, ranges.length - 1).map((range, index) => `${range}% - ${ranges[index + 1]}%`),
    //         datasets: [{
    //             label: 'Student Distribution',
    //             data: studentCounts,
    //             backgroundColor: ['#FF5733', '#33FF57', '#5733FF', '#33FFF6', '#FFC300'],
    //         }]
    //     }
    // })
    // ;
}

// Search and Filter
function searchData() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('dataTable').rows;
    
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].cells;
        let match = false;
        
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(searchInput)) {
                match = true;
                break;
            }
        }
        
        rows[i].style.display = match ? '' : 'none';
    }
}

// Export Data to CSV
function exportToCSV() {
    const rows = document.getElementById('dataTable').rows;
    const csvContent = Array.from(rows)
        .map(row => Array.from(row.cells).map(cell => cell.textContent).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_data.csv';
    link.click();
}

// Export Individual Report as PDF
function generateReport(index) {
    const doc = new jsPDF();
    doc.text(`Student Report for Student ${index}`, 20, 20);
    doc.text(`Placement Chances: ${document.getElementById('dataTable').rows[index].cells[3].innerText}`, 20, 40);
    doc.save('student_report.pdf');
}
