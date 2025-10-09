
    // Initialize with sample data
    document.addEventListener('DOMContentLoaded', function() {
      // Check if there's saved data
      if(localStorage.getItem('gpaCalculatorData')) {
        loadData();
      } else {
        initializeSemesters();
      }
      updateCGPAOverview();
      updateProgress();
      updateStorageInfo();
    });

    function switchTab(tabName) {
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected tab and mark as active
      let tabContentId;
      switch(tabName) {
        case 'current':
          tabContentId = 'current-semester';
          break;
        case 'overview':
          tabContentId = 'cgpa-overview';
          break;
        case 'progress':
          tabContentId = 'academic-progress';
          break;
        case 'data':
          tabContentId = 'data-management';
          updateStorageInfo();
          break;
      }
      
      document.getElementById(tabContentId).style.display = 'block';
      event.target.classList.add('active');
      
      if (tabName === 'overview') {
        updateCGPAOverview();
      } else if (tabName === 'progress') {
        updateProgress();
      }
    }

    function initializeSemesters() {
      const semesters = {};
      for (let i = 1; i <= 8; i++) {
        semesters[i] = {
          subjects: [
            { subject: "", marks: "", credit: 3 }
          ],
          gpa: 0,
          totalCredits: 0,
          completed: false
        };
      }
      localStorage.setItem('semesterData', JSON.stringify(semesters));
    }

    function addSubject() {
      const tableBody = document.getElementById("tableBody");
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" placeholder="e.g. Computer Science"></td>
        <td><input type="number" min="0" max="100" placeholder="Marks"></td>
        <td><input type="number" min="1" max="4" placeholder="Credit" value="3"></td>
        <td>-</td>
        <td>-</td>
        <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
      `;
      tableBody.appendChild(newRow);
    }

    function deleteRow(button) {
      const row = button.parentNode.parentNode;
      const tableBody = document.getElementById("tableBody");
      
      // Don't delete if it's the last row
      if (tableBody.children.length > 1) {
        row.parentNode.removeChild(row);
      } else {
        alert("You need at least one subject row.");
      }
    }

    function calculateResult() {
      const currentSemester = document.getElementById('semester').value;
      const rows = document.querySelectorAll("#tableBody tr");
      let totalMarks = 0;
      let obtainedMarks = 0;
      let totalCredits = 0;
      let weightedTotal = 0;
      let allPassed = true;
      
      const subjects = [];

      rows.forEach(row => {
        const subjectInput = row.children[0].querySelector("input");
        const marksInput = row.children[1].querySelector("input");
        const creditInput = row.children[2].querySelector("input");
        const gradeCell = row.children[3];
        const statusCell = row.children[4];
        
        const subject = subjectInput.value;
        const marks = parseFloat(marksInput.value);
        const credit = parseFloat(creditInput.value);

        if (!isNaN(marks) && !isNaN(credit) && subject.trim() !== "") {
          totalMarks += 100;
          obtainedMarks += marks;
          totalCredits += credit;

          // Calculate grade points
          let gradePoint = 0;
          let grade = "";
          
          if (marks >= 85) {
            gradePoint = 4.0;
            grade = "A+";
          } else if (marks >= 80) {
            gradePoint = 4.0;
            grade = "A";
          } else if (marks >= 75) {
            gradePoint = 3.5;
            grade = "B+";
          } else if (marks >= 70) {
            gradePoint = 3.0;
            grade = "B";
          } else if (marks >= 65) {
            gradePoint = 2.5;
            grade = "C+";
          } else if (marks >= 60) {
            gradePoint = 2.0;
            grade = "C";
          } else if (marks >= 55) {
            gradePoint = 1.5;
            grade = "D+";
          } else if (marks >= 50) {
            gradePoint = 1.0;
            grade = "D";
          } else {
            gradePoint = 0;
            grade = "F";
            allPassed = false;
          }

          weightedTotal += gradePoint * credit;
          
          // Update grade cell
          gradeCell.innerHTML = `<span class="grade-${grade.charAt(0)}">${grade} (${gradePoint.toFixed(1)})</span>`;
          
          // Update status cell
          statusCell.innerHTML = marks >= 50 
            ? `<span class='pass'>Pass</span>` 
            : `<span class='fail'>Fail</span>`;
            
          // Save subject data
          subjects.push({
            subject: subject,
            marks: marks,
            credit: credit,
            grade: grade,
            gradePoint: gradePoint
          });
        } else {
          gradeCell.innerHTML = "-";
          statusCell.innerHTML = "-";
        }
      });

      // Calculate overall results
      const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;
      const gpa = totalCredits > 0 ? (weightedTotal / totalCredits).toFixed(2) : 0;
      
      // Determine overall grade
      let overallGrade = "";
      let gradeClass = "";
      
      if (percentage >= 85) {
        overallGrade = "A+";
        gradeClass = "grade-A";
      } else if (percentage >= 80) {
        overallGrade = "A";
        gradeClass = "grade-A";
      } else if (percentage >= 75) {
        overallGrade = "B+";
        gradeClass = "grade-B";
      } else if (percentage >= 70) {
        overallGrade = "B";
        gradeClass = "grade-B";
      } else if (percentage >= 65) {
        overallGrade = "C+";
        gradeClass = "grade-C";
      } else if (percentage >= 60) {
        overallGrade = "C";
        gradeClass = "grade-C";
      } else if (percentage >= 55) {
        overallGrade = "D+";
        gradeClass = "grade-D";
      } else if (percentage >= 50) {
        overallGrade = "D";
        gradeClass = "grade-D";
      } else {
        overallGrade = "F";
        gradeClass = "grade-F";
        allPassed = false;
      }

      // Display results
      document.getElementById("resultBox").innerHTML = `
        <h3>📘 Academic Performance Summary</h3>
        <div class="result-grid">
          <div class="result-item">
            <div>Total Marks</div>
            <div class="result-value">${obtainedMarks} / ${totalMarks}</div>
          </div>
          <div class="result-item">
            <div>Percentage</div>
            <div class="result-value">${percentage}%</div>
          </div>
          <div class="result-item">
            <div>GPA</div>
            <div class="result-value">${gpa}</div>
          </div>
          <div class="result-item">
            <div>Overall Grade</div>
            <div class="result-value ${gradeClass}">${overallGrade}</div>
          </div>
          <div class="result-item">
            <div>Status</div>
            <div class="result-value ${allPassed ? 'pass' : 'fail'}">${allPassed ? 'PASSED' : 'FAILED'}</div>
          </div>
        </div>
        <p style="margin-top: 15px;"><strong>Semester:</strong> ${document.getElementById('semester').options[document.getElementById('semester').selectedIndex].text}</p>
      `;
      
      // Save semester data
      saveSemesterData(currentSemester, subjects, parseFloat(gpa), totalCredits, allPassed);
      updateCGPAOverview();
      updateProgress();
      updateStorageInfo();
    }

    function saveSemesterData(semester, subjects, gpa, totalCredits, completed) {
      const semesterData = JSON.parse(localStorage.getItem('semesterData')) || {};
      semesterData[semester] = {
        subjects: subjects,
        gpa: gpa,
        totalCredits: totalCredits,
        completed: completed && subjects.length > 0
      };
      localStorage.setItem('semesterData', JSON.stringify(semesterData));
      
      // Update last updated timestamp
      localStorage.setItem('lastUpdated', new Date().toLocaleString());
    }

    function loadSemesterData() {
      const semester = document.getElementById('semester').value;
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      
      if (semesterData && semesterData[semester]) {
        const data = semesterData[semester];
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = '';
        
        data.subjects.forEach(subjectData => {
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td><input type="text" value="${subjectData.subject}"></td>
            <td><input type="number" min="0" max="100" value="${subjectData.marks}"></td>
            <td><input type="number" min="1" max="4" value="${subjectData.credit}"></td>
            <td>${subjectData.grade} (${subjectData.gradePoint})</td>
            <td>${subjectData.marks >= 50 ? '<span class="pass">Pass</span>' : '<span class="fail">Fail</span>'}</td>
            <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
          `;
          tableBody.appendChild(newRow);
        });
        
        // Update result box if GPA is available
        if (data.gpa > 0) {
          document.getElementById("resultBox").innerHTML = `
            <h3>📘 Academic Performance Summary</h3>
            <div class="result-grid">
              <div class="result-item">
                <div>GPA</div>
                <div class="result-value">${data.gpa}</div>
              </div>
              <div class="result-item">
                <div>Total Credits</div>
                <div class="result-value">${data.totalCredits}</div>
              </div>
              <div class="result-item">
                <div>Status</div>
                <div class="result-value ${data.completed ? 'pass' : 'fail'}">${data.completed ? 'COMPLETED' : 'INCOMPLETE'}</div>
              </div>
            </div>
            <p style="margin-top: 15px;"><strong>Semester:</strong> ${document.getElementById('semester').options[document.getElementById('semester').selectedIndex].text}</p>
          `;
        }
      } else {
        // Reset to empty table
        document.getElementById("tableBody").innerHTML = `
          <tr>
            <td><input type="text" placeholder="e.g. Mathematics"></td>
            <td><input type="number" min="0" max="100" placeholder="Marks"></td>
            <td><input type="number" min="1" max="4" placeholder="Credit" value="3"></td>
            <td>-</td>
            <td>-</td>
            <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
          </tr>
        `;
        document.getElementById("resultBox").innerHTML = `<h3>Your Result will appear here 📊</h3>`;
      }
    }

    function updateCGPAOverview() {
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      if (!semesterData) return;
      
      let totalWeightedGPA = 0;
      let totalCredits = 0;
      let completedSemesters = 0;
      
      const semesterResults = document.getElementById('semester-results');
      semesterResults.innerHTML = '';
      
      for (let i = 1; i <= 8; i++) {
        if (semesterData[i] && semesterData[i].completed) {
          const gpa = semesterData[i].gpa;
          const credits = semesterData[i].totalCredits;
          
          totalWeightedGPA += gpa * credits;
          totalCredits += credits;
          completedSemesters++;
          
          // Create semester card
          const semesterCard = document.createElement('div');
          semesterCard.className = 'semester-card';
          semesterCard.innerHTML = `
            <h4>Semester ${i}</h4>
            <p><strong>GPA:</strong> ${gpa}</p>
            <p><strong>Credits:</strong> ${credits}</p>
            <p><strong>Status:</strong> <span class="pass">Completed</span></p>
          `;
          semesterCard.onclick = function() {
            document.getElementById('semester').value = i;
            switchTab('current');
            loadSemesterData();
          };
          semesterResults.appendChild(semesterCard);
        } else {
          // Create empty semester card
          const semesterCard = document.createElement('div');
          semesterCard.className = 'semester-card';
          semesterCard.innerHTML = `
            <h4>Semester ${i}</h4>
            <p><strong>GPA:</strong> -</p>
            <p><strong>Credits:</strong> -</p>
            <p><strong>Status:</strong> <span class="fail">Incomplete</span></p>
          `;
          semesterCard.onclick = function() {
            document.getElementById('semester').value = i;
            switchTab('current');
            loadSemesterData();
          };
          semesterResults.appendChild(semesterCard);
        }
      }
      
      // Calculate overall CGPA
      const overallCGPA = totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : 0;
      
      // Update overview
      document.getElementById('overall-cgpa').textContent = overallCGPA;
      document.getElementById('total-credits').textContent = totalCredits;
      document.getElementById('completed-semesters').textContent = `${completedSemesters}/8`;
      
      // Determine overall grade
      let overallGrade = "-";
      if (overallCGPA >= 3.7) overallGrade = "A+";
      else if (overallCGPA >= 3.3) overallGrade = "A";
      else if (overallCGPA >= 3.0) overallGrade = "B+";
      else if (overallCGPA >= 2.7) overallGrade = "B";
      else if (overallCGPA >= 2.3) overallGrade = "C+";
      else if (overallCGPA >= 2.0) overallGrade = "C";
      else if (overallCGPA >= 1.7) overallGrade = "D+";
      else if (overallCGPA >= 1.0) overallGrade = "D";
      else if (overallCGPA > 0) overallGrade = "F";
      
      document.getElementById('overall-grade').textContent = overallGrade;
      document.getElementById('overall-grade').className = `result-value grade-${overallGrade.charAt(0)}`;
    }

    function updateProgress() {
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      if (!semesterData) return;
      
      let totalCredits = 0;
      let completedSemesters = 0;
      
      for (let i = 1; i <= 8; i++) {
        if (semesterData[i] && semesterData[i].completed) {
          totalCredits += semesterData[i].totalCredits;
          completedSemesters++;
        }
      }
      
      // Update credit progress
      const creditProgress = (totalCredits / 120) * 100;
      document.getElementById('completed-credits').textContent = totalCredits;
      document.getElementById('credit-progress').style.width = `${creditProgress}%`;
      
      // Update degree progress
      const degreeProgress = (completedSemesters / 8) * 100;
      document.getElementById('completed-sem-count').textContent = completedSemesters;
      document.getElementById('degree-progress').style.width = `${degreeProgress}%`;
      
      // Update CGPA chart
      updateCGPAChart();
    }

    function updateCGPAChart() {
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      const chartContainer = document.getElementById('cgpa-chart');
      chartContainer.innerHTML = '';
      
      if (!semesterData) {
        chartContainer.innerHTML = '<p>No data available. Add semester results to see your progress.</p>';
        return;
      }
      
      // Create a simple bar chart
      for (let i = 1; i <= 8; i++) {
        const semesterDiv = document.createElement('div');
        semesterDiv.style.marginBottom = '10px';
        semesterDiv.style.display = 'flex';
        semesterDiv.style.alignItems = 'center';
        
        const label = document.createElement('div');
        label.textContent = `Sem ${i}`;
        label.style.width = '60px';
        label.style.fontWeight = '500';
        
        const barContainer = document.createElement('div');
        barContainer.style.flex = '1';
        barContainer.style.height = '20px';
        barContainer.style.backgroundColor = '#e0e0e0';
        barContainer.style.borderRadius = '10px';
        barContainer.style.overflow = 'hidden';
        barContainer.style.margin = '0 10px';
        
        const bar = document.createElement('div');
        bar.style.height = '100%';
        bar.style.width = semesterData[i] && semesterData[i].completed ? `${(semesterData[i].gpa / 4) * 100}%` : '0%';
        bar.style.backgroundColor = semesterData[i] && semesterData[i].completed ? 
          (semesterData[i].gpa >= 3.0 ? '#4caf50' : 
           semesterData[i].gpa >= 2.0 ? '#ff9800' : '#f44336') : '#e0e0e0';
        bar.style.borderRadius = '10px';
        bar.style.transition = 'width 0.5s ease';
        
        const value = document.createElement('div');
        value.textContent = semesterData[i] && semesterData[i].completed ? semesterData[i].gpa : '-';
        value.style.width = '40px';
        value.style.textAlign = 'right';
        value.style.fontWeight = '500';
        
        barContainer.appendChild(bar);
        semesterDiv.appendChild(label);
        semesterDiv.appendChild(barContainer);
        semesterDiv.appendChild(value);
        chartContainer.appendChild(semesterDiv);
      }
    }

    function resetCurrentSemester() {
      showResetModal();
    }

    function resetCurrentSemesterConfirmed() {
      const currentSemester = document.getElementById('semester').value;
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      
      if (semesterData && semesterData[currentSemester]) {
        // Reset the current semester data
        semesterData[currentSemester] = {
          subjects: [
            { subject: "", marks: "", credit: 3 }
          ],
          gpa: 0,
          totalCredits: 0,
          completed: false
        };
        
        localStorage.setItem('semesterData', JSON.stringify(semesterData));
        
        // Reset the UI
        document.getElementById("tableBody").innerHTML = `
          <tr>
            <td><input type="text" placeholder="e.g. Mathematics"></td>
            <td><input type="number" min="0" max="100" placeholder="Marks"></td>
            <td><input type="number" min="1" max="4" placeholder="Credit" value="3"></td>
            <td>-</td>
            <td>-</td>
            <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
          </tr>
        `;
        document.getElementById("resultBox").innerHTML = `<h3>Your Result will appear here 📊</h3>`;
        
        // Update all views
        updateCGPAOverview();
        updateProgress();
        updateStorageInfo();
        
        closeModal('resetModal');
        alert('Current semester data has been reset successfully!');
      }
    }

    function showResetModal() {
      document.getElementById('resetModal').style.display = 'flex';
    }

    function showDeleteModal() {
      document.getElementById('deleteModal').style.display = 'flex';
    }

    function closeModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }

    function deleteAllData() {
      // Clear all localStorage data
      localStorage.clear();
      
      // Reinitialize with empty data
      initializeSemesters();
      
      // Reset the UI
      document.getElementById("tableBody").innerHTML = `
        <tr>
          <td><input type="text" placeholder="e.g. Mathematics"></td>
          <td><input type="number" min="0" max="100" placeholder="Marks"></td>
          <td><input type="number" min="1" max="4" placeholder="Credit" value="3"></td>
          <td>-</td>
          <td>-</td>
          <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
        </tr>
      `;
      document.getElementById("studentName").value = "";
      document.getElementById("studentID").value = "";
      document.getElementById("semester").selectedIndex = 0;
      document.getElementById("resultBox").innerHTML = `<h3>Your Result will appear here 📊</h3>`;
      
      // Update all views
      updateCGPAOverview();
      updateProgress();
      updateStorageInfo();
      
      closeModal('deleteModal');
      alert('All data has been deleted successfully!');
    }

    function updateStorageInfo() {
      // Calculate data size
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      const dataSizeKB = (totalSize / 1024).toFixed(2);
      document.getElementById('data-size').textContent = `${dataSizeKB} KB`;
      
      // Get last updated time
      const lastUpdated = localStorage.getItem('lastUpdated') || '-';
      document.getElementById('last-updated').textContent = lastUpdated;
      
      // Count semesters with data
      const semesterData = JSON.parse(localStorage.getItem('semesterData'));
      let semestersWithData = 0;
      if (semesterData) {
        for (let i = 1; i <= 8; i++) {
          if (semesterData[i] && semesterData[i].completed) {
            semestersWithData++;
          }
        }
      }
      document.getElementById('semesters-with-data').textContent = semestersWithData;
    }

    function exportAllData() {
      const allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allData[key] = localStorage.getItem(key);
      }
      
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'academic_data_backup.json';
      link.click();
      
      alert('All data exported successfully!');
    }

    function importData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
          try {
            const importedData = JSON.parse(event.target.result);
            
            // Import each key-value pair
            for (let key in importedData) {
              localStorage.setItem(key, importedData[key]);
            }
            
            // Reload the application
            loadData();
            updateCGPAOverview();
            updateProgress();
            updateStorageInfo();
            
            alert('Data imported successfully!');
          } catch (error) {
            alert('Error importing data: Invalid file format');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    }

    function saveData() {
      const subjects = [];
      const rows = document.querySelectorAll("#tableBody tr");
      
      rows.forEach(row => {
        const subject = row.children[0].querySelector("input").value;
        const marks = row.children[1].querySelector("input").value;
        const credit = row.children[2].querySelector("input").value;
        
        if(subject && marks && credit) {
          subjects.push({subject, marks, credit});
        }
      });
      
      const data = {
        studentName: document.getElementById('studentName').value,
        studentID: document.getElementById('studentID').value,
        semester: document.getElementById('semester').value,
        subjects: subjects
      };
      
      localStorage.setItem('gpaCalculatorData', JSON.stringify(data));
      alert('Current semester data saved successfully!');
    }

    function loadData() {
      const savedData = localStorage.getItem('gpaCalculatorData');
      if(savedData) {
        const data = JSON.parse(savedData);
        
        document.getElementById('studentName').value = data.studentName || '';
        document.getElementById('studentID').value = data.studentID || '';
        document.getElementById('semester').value = data.semester || '1';
        
        // Clear existing rows
        document.getElementById("tableBody").innerHTML = '';
        
        // Add rows from saved data
        if(data.subjects && data.subjects.length > 0) {
          data.subjects.forEach(subjectData => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
              <td><input type="text" value="${subjectData.subject}"></td>
              <td><input type="number" min="0" max="100" value="${subjectData.marks}"></td>
              <td><input type="number" min="1" max="4" value="${subjectData.credit}"></td>
              <td>-</td>
              <td>-</td>
              <td><button class="reset-btn" onclick="deleteRow(this)" style="padding: 5px 8px;">✕</button></td>
            `;
            document.getElementById("tableBody").appendChild(newRow);
          });
        } else {
          // Add one empty row if no subjects saved
          addSubject();
        }
        
        alert('Current semester data loaded successfully!');
      } else {
        alert('No saved data found!');
      }
    }

    function exportToPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 120, 255);
      doc.text("Academic Performance Report", 105, 20, { align: "center" });
      
      // Add student info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Student Name: ${document.getElementById('studentName').value || 'Not specified'}`, 20, 40);
      doc.text(`Student ID: ${document.getElementById('studentID').value || 'Not specified'}`, 20, 50);
      doc.text(`Semester: ${document.getElementById('semester').options[document.getElementById('semester').selectedIndex].text}`, 20, 60);
      
      // Add table headers
      doc.setFillColor(0, 120, 255);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, 70, 170, 10, 'F');
      doc.text("Subject", 25, 77);
      doc.text("Marks", 80, 77);
      doc.text("Credits", 120, 77);
      doc.text("Grade", 150, 77);
      doc.text("Status", 180, 77);
      
      // Add table data
      doc.setTextColor(0, 0, 0);
      let yPosition = 85;
      const rows = document.querySelectorAll("#tableBody tr");
      
      rows.forEach(row => {
        const subject = row.children[0].querySelector("input").value;
        const marks = row.children[1].querySelector("input").value;
        const credit = row.children[2].querySelector("input").value;
        const grade = row.children[3].textContent;
        const status = row.children[4].textContent;
        
        if(subject && marks && credit) {
          doc.text(subject, 25, yPosition);
          doc.text(marks, 80, yPosition);
          doc.text(credit, 120, yPosition);
          doc.text(grade, 150, yPosition);
          doc.text(status, 180, yPosition);
          yPosition += 8;
        }
      });
      
      // Add summary
      const resultBox = document.getElementById("resultBox");
      if(resultBox.children.length > 1) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 120, 255);
        doc.text("Performance Summary", 105, yPosition, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
        
        const resultItems = resultBox.querySelectorAll('.result-item');
        resultItems.forEach(item => {
          const label = item.children[0].textContent;
          const value = item.children[1].textContent;
          doc.text(`${label}: ${value}`, 20, yPosition);
          yPosition += 7;
        });
      }
      
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Generated by Academic Performance Calculator", 105, 280, { align: "center" });
      
      // Save the PDF
      doc.save("Academic_Report.pdf");
    }
 