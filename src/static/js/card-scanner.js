document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    let previewContainer = document.getElementById('preview-container');
    let imagePreview = document.getElementById('image-preview');
    const resultsContainer = document.getElementById('results-container');
    const contactDetails = document.getElementById('contact-details');
    const downloadVcfBtn = document.getElementById('download-vcf');
    const scanAnotherBtn = document.getElementById('scan-another');
    const loadingIndicator = document.getElementById('loading');
    const submitBtn = document.getElementById('submit-btn');
    
    // Debug element for visibility into what's happening
    const debugArea = document.createElement('div');
    debugArea.id = 'debug-area';
    debugArea.className = 'alert alert-info mt-3 d-none';
    debugArea.innerHTML = '<h5>Debug Info:</h5><pre id="debug-log"></pre>';
    document.querySelector('.card-body').appendChild(debugArea);
    
    const debugLog = document.getElementById('debug-log');
    let lastContactData = null;

    // Helper function to add debug messages
    function addDebug(message) {
        console.log(message);
        if (debugLog) {
            debugLog.textContent += message + '\n';
            debugArea.classList.remove('d-none');
        }
    }

    // Check if elements exist
    if (!dropArea) addDebug("Error: drop-area element not found");
    if (!fileInput) addDebug("Error: fileInput element not found");
    if (!uploadForm) addDebug("Error: uploadForm element not found");
    if (!submitBtn) addDebug("Error: submit-btn element not found");

    // Drag and drop handlers
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle file drop
        dropArea.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Replace the fileInput change handler with this improved version
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            event.preventDefault();
            addDebug("File input changed: " + this.files.length + " files selected");
            
            // Force visibility of debug info to see what's happening
            debugArea.classList.remove('d-none');
            
            // Create a direct FormData object from the input
            const formData = new FormData();
            for (let i = 0; i < this.files.length; i++) {
                formData.append('images', this.files[i]);
                addDebug("Added file directly: " + this.files[i].name + " (" + this.files[i].size + " bytes)");
            }
            
            // Store on uploadForm
            if (uploadForm) {
                uploadForm.formData = formData;
                addDebug("FormData stored on uploadForm (direct method)");
            } else {
                addDebug("ERROR: uploadForm not found for storing FormData");
            }
            
            // Now call the preview handler
            handleFiles(this.files);
        });
    }

    // Also let's fix the handleFiles function to debug more extensively
    function handleFiles(files) {
        addDebug("handleFiles called with " + (files ? files.length : 0) + " files");
        
        if (!files || files.length === 0) {
            addDebug("No files to process in handleFiles");
            return;
        }
        
        // Check the previewContainer and imagePreview
        addDebug("previewContainer exists: " + (previewContainer ? "YES" : "NO"));
        addDebug("imagePreview exists: " + (imagePreview ? "YES" : "NO"));
        
        // Create elements if they don't exist
        if (!previewContainer) {
            addDebug("Creating missing previewContainer");
            previewContainer = document.createElement('div');
            previewContainer.id = 'preview-container';
            previewContainer.className = 'mt-4';
            const heading = document.createElement('h4');
            heading.className = 'text-center mb-3';
            heading.textContent = 'Preview';
            previewContainer.appendChild(heading);
            
            // Insert after uploadForm if it exists
            if (uploadForm) {
                uploadForm.parentNode.insertBefore(previewContainer, uploadForm.nextSibling);
            } else {
                // Fallback insertion
                document.querySelector('.card-body').appendChild(previewContainer);
            }
        }
        
        if (!imagePreview) {
            addDebug("Creating missing imagePreview");
            imagePreview = document.createElement('div');
            imagePreview.id = 'image-preview';
            imagePreview.className = 'd-flex flex-wrap justify-content-center';
            previewContainer.appendChild(imagePreview);
        } else {
            // Clear existing preview
            imagePreview.innerHTML = '';
        }
        
        // Make sure preview container is visible
        previewContainer.classList.remove('d-none');
        
        // Process each file
        let processed = 0;
        
        Array.from(files).forEach(file => {
            if (!file.type.match('image.*')) {
                addDebug("Skipping non-image file: " + file.name);
                return;
            }
            
            addDebug("Creating preview for: " + file.name + " (" + file.size + " bytes)");
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                addDebug("FileReader onload triggered for: " + file.name);
                
                try {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('preview-image', 'img-thumbnail', 'm-2');
                    img.style.maxHeight = '150px';
                    img.style.maxWidth = '200px';
                    imagePreview.appendChild(img);
                    processed++;
                    
                    addDebug("Image preview added: " + processed + " of " + files.length);
                } catch (error) {
                    addDebug("ERROR adding preview: " + error.message);
                }
            };
            
            reader.onerror = function() {
                addDebug("ERROR: FileReader failed for: " + file.name);
            };
            
            // Start reading the file
            reader.readAsDataURL(file);
        });
    }

    // Make sure this function is added outside any other function
    function checkFileInput() {
        addDebug("Checking file input status");
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            addDebug(`File input has ${fileInput.files.length} files`);
        } else {
            addDebug("File input is empty");
        }
        
        if (uploadForm) {
            if (uploadForm.formData) {
                const images = uploadForm.formData.getAll('images');
                addDebug(`Form has ${images ? images.length : 0} images in FormData`);
            } else {
                addDebug("No formData on uploadForm");
            }
        }
    }

    // Modify the submit button click handler to call the check function
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addDebug("Submit button clicked");
            
            // First check what we have
            checkFileInput();
            
            // Create direct FormData from file input as fallback
            if ((!uploadForm || !uploadForm.formData) && fileInput && fileInput.files.length > 0) {
                addDebug("Creating new FormData from fileInput as fallback");
                const formData = new FormData();
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('images', fileInput.files[i]);
                }
                
                if (uploadForm) {
                    uploadForm.formData = formData;
                    addDebug("FormData created and stored as fallback");
                }
            }
            
            if (uploadForm && uploadForm.formData) {
                const images = uploadForm.formData.getAll('images');
                if (images && images.length > 0) {
                    addDebug(`Submitting with ${images.length} images`);
                    
                    // Show loading indicator right away
                    if (loadingIndicator) {
                        loadingIndicator.classList.remove('d-none');
                    }
                    
                    // Manually handle the submission instead of using the event
                    submitFormWithFiles(uploadForm.formData);
                } else {
                    addDebug("No images in formData");
                    alert('Please select at least one image first.');
                }
            } else {
                addDebug("No formData available for submission");
                alert('Please select at least one image first.');
            }
        });
    }

    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            addDebug("Form submission triggered");
            
            if (!this.formData || this.formData.getAll('images').length === 0) {
                addDebug("Error: No images in formData");
                alert('Please select at least one image first.');
                return;
            }
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.remove('d-none');
            }
            
            if (resultsContainer) {
                resultsContainer.classList.add('d-none');
            }
            
            try {
                addDebug("Sending " + this.formData.getAll('images').length + " images to server");
                
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                addDebug("CSRF token: " + (csrftoken ? "Found" : "Not found"));
                
                addDebug("Sending POST request to /analyze/");
                const response = await fetch('/analyze/', {
                    method: 'POST',
                    body: this.formData,
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                });
                
                addDebug("Response status: " + response.status);
                
                if (!response.ok) {
                    throw new Error('Server returned ' + response.status + ': ' + response.statusText);
                }
                
                const data = await response.json();
                addDebug("Response data: " + JSON.stringify(data).substring(0, 100) + "...");
                
                displayResults(data);
                lastContactData = data;
            } catch (error) {
                addDebug("Error: " + error.message);
                console.error('Error:', error);
                alert('There was an error processing your card: ' + error.message);
            } finally {
                if (loadingIndicator) {
                    loadingIndicator.classList.add('d-none');
                }
            }
        });
    }

    // New function to handle form submission directly
    async function submitFormWithFiles(formData) {
        addDebug("Manual form submission started");
        
        if (!formData || formData.getAll('images').length === 0) {
            addDebug("Error: No images in formData");
            if (loadingIndicator) loadingIndicator.classList.add('d-none');
            alert('Please select at least one image first.');
            return;
        }
        
        try {
            addDebug("Sending " + formData.getAll('images').length + " images to server");
            
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            addDebug("CSRF token: " + (csrftoken ? "Found" : "Not found"));
            
            // Make sure we're sending to the correct URL
            const url = '/analyze/';
            addDebug("Sending POST request to: " + url);
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrftoken
                }
            });
            
            addDebug("Response status: " + response.status + " " + response.statusText);
            
            if (!response.ok) {
                throw new Error('Server returned ' + response.status + ': ' + response.statusText);
            }
            
            const data = await response.json();
            addDebug("Response received: " + JSON.stringify(data).substring(0, 100) + "...");
            
            displayResults(data);
            lastContactData = data;
        } catch (error) {
            addDebug("Error during submission: " + error.message);
            console.error('Error:', error);
            alert('There was an error processing your card: ' + error.message);
        } finally {
            if (loadingIndicator) {
                loadingIndicator.classList.add('d-none');
            }
        }
    }

    // Replace your displayResults function with this improved version
    function displayResults(data) {
        addDebug("Displaying results");
        
        // Clear previous results
        if (contactDetails) {
            contactDetails.innerHTML = '';
        }
        
        // Get the results array - handle both cases
        const resultsArray = data.results ? data.results : [data];
        addDebug(`Displaying ${resultsArray.length} contacts`);
        
        // Create a responsive wrapper for the table
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-responsive';
        tableWrapper.style.overflowX = 'auto';
        
        // Create contacts table
        const contactsTable = document.createElement('table');
        contactsTable.className = 'table table-striped';
        contactsTable.style.minWidth = '800px'; // Ensure minimum width for proper display
        
        // Create table header
        const tableHeader = document.createElement('thead');
        tableHeader.className = 'table-primary';
        const headerRow = document.createElement('tr');
        
        // Add checkbox column in header
        const checkboxHeader = document.createElement('th');
        checkboxHeader.style.width = '40px';
        
        // Create "Select All" checkbox
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.className = 'form-check-input select-all-contacts';
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.contact-select-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        checkboxHeader.appendChild(selectAllCheckbox);
        headerRow.appendChild(checkboxHeader);
        
        // Add the rest of the header columns
        const headerColumns = ['Name', 'Position', 'Company', 'Phone', 'Email', 'Website', 'Address', 'Actions'];
        
        headerColumns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        tableHeader.appendChild(headerRow);
        contactsTable.appendChild(tableHeader);
        
        // Create table body
        const tableBody = document.createElement('tbody');
        
        // Store valid contacts for batch download
        const validContacts = [];
        
        resultsArray.forEach((contact, index) => {
            // Skip if this is an error entry
            if (contact.error) {
                addDebug(`Skipping error entry: ${contact.error}`);
                return;
            }
            
            validContacts.push(contact);
            
            const row = document.createElement('tr');
            
            // Add checkbox cell
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input contact-select-checkbox';
            checkbox.dataset.contactIndex = index;
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);
            
            // Add data cells
            [
                { key: 'name', isLink: false },
                { key: 'position', isLink: false },
                { key: 'company', isLink: false },
                { key: 'phone', isLink: true, prefix: 'tel:' },
                { key: 'email', isLink: true, prefix: 'mailto:' },
                { key: 'website', isLink: true, prefix: '' },
                { key: 'address', isLink: false }
            ].forEach(field => {
                const td = document.createElement('td');
                
                if (contact[field.key]) {
                    if (field.isLink) {
                        const link = document.createElement('a');
                        let href = contact[field.key];
                        if (field.prefix) {
                            href = field.prefix + href;
                        } else if (field.key === 'website' && !href.startsWith('http')) {
                            href = 'http://' + href;
                        }
                        link.href = href;
                        link.textContent = contact[field.key];
                        if (field.key === 'website') {
                            link.target = '_blank';
                        }
                        td.appendChild(link);
                    } else {
                        td.textContent = contact[field.key];
                    }
                } else {
                    td.textContent = '-';
                }
                
                row.appendChild(td);
            });
            
            // Add action buttons
            const actionsTd = document.createElement('td');
            
            // Download VCF button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-sm btn-success me-1';
            downloadBtn.innerHTML = '<i class="fas fa-address-card"></i>';
            downloadBtn.title = 'Download VCF';
            downloadBtn.addEventListener('click', function() {
                generateAndDownloadVCard(contact);
            });
            actionsTd.appendChild(downloadBtn);
            
            row.appendChild(actionsTd);
            tableBody.appendChild(row);
        });
        
        contactsTable.appendChild(tableBody);
        tableWrapper.appendChild(contactsTable);
        
        if (contactDetails) {
            // Add a heading with count
            const heading = document.createElement('h3');
            heading.textContent = `${validContacts.length} Contacts Found`;
            heading.className = 'mb-3';
            contactDetails.appendChild(heading);
            
            // Add bulk download button
            const bulkDownloadContainer = document.createElement('div');
            bulkDownloadContainer.className = 'mb-3';
            
            const bulkDownloadBtn = document.createElement('button');
            bulkDownloadBtn.className = 'btn btn-primary me-2';
            bulkDownloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download Selected VCFs';
            bulkDownloadBtn.addEventListener('click', function() {
                const selectedCheckboxes = document.querySelectorAll('.contact-select-checkbox:checked');
                
                if (selectedCheckboxes.length === 0) {
                    alert('Please select at least one contact to download.');
                    return;
                }
                
                // Download selected contacts
                selectedCheckboxes.forEach(checkbox => {
                    const index = parseInt(checkbox.dataset.contactIndex);
                    if (!isNaN(index) && index >= 0 && index < resultsArray.length) {
                        generateAndDownloadVCard(resultsArray[index]);
                    }
                });
            });
            
            bulkDownloadContainer.appendChild(bulkDownloadBtn);
            
            // Add scan another button in the same row
            if (scanAnotherBtn) {
                const scanAnotherClone = scanAnotherBtn.cloneNode(true);
                scanAnotherClone.className = 'btn btn-outline-secondary';
                scanAnotherClone.innerHTML = '<i class="fas fa-redo me-1"></i> Scan Another';
                scanAnotherClone.addEventListener('click', function() {
                    if (resultsContainer) {
                        resultsContainer.classList.add('d-none');
                    }
                    
                    if (previewContainer) {
                        previewContainer.classList.add('d-none');
                    }
                    
                    if (imagePreview) {
                        imagePreview.innerHTML = '';
                    }
                    
                    lastContactData = null;
                });
                bulkDownloadContainer.appendChild(scanAnotherClone);
            }
            
            contactDetails.appendChild(bulkDownloadContainer);
            
            // Add the responsive table wrapper
            contactDetails.appendChild(tableWrapper);
        }
        
        // Show results container
        if (resultsContainer) {
            resultsContainer.classList.remove('d-none');
        }
    }

    // Helper function to generate and download a vCard
    function generateAndDownloadVCard(contact) {
        addDebug("Generating VCF for " + (contact.name || "unnamed contact"));
        
        const vcard = generateVCard(contact);
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contact.name || 'contact'}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addDebug("VCF download triggered");
    }

    function generateVCard(contact) {
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${contact.name || ''}`,
            `N:${contact.name || ''};;;`,
            contact.email ? `EMAIL:${contact.email}` : '',
            contact.phone ? `TEL:${contact.phone}` : '',
            contact.company ? `ORG:${contact.company}` : '',
            contact.position ? `TITLE:${contact.position}` : '',
            contact.website ? `URL:${contact.website}` : '',
            contact.address ? `ADR:;;${contact.address};;;` : '',
            'END:VCARD'
        ];
        
        return lines.filter(line => line !== '').join('\r\n');
    }

    // Scan another button
    if (scanAnotherBtn) {
        scanAnotherBtn.addEventListener('click', function() {
            addDebug("Scan another button clicked");
            
            if (resultsContainer) {
                resultsContainer.classList.add('d-none');
            }
            
            if (previewContainer) {
                previewContainer.classList.add('d-none');
            }
            
            if (imagePreview) {
                imagePreview.innerHTML = '';
            }
            
            lastContactData = null;
        });
    }

    // Initial debug message
    addDebug("Card scanner script initialized");
});