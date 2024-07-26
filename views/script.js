document.querySelector('.add-input-field').addEventListener('click', function(event) {
    event.preventDefault();
    const newInputGroup = document.createElement('div');
    newInputGroup.className = 'input-group';
    newInputGroup.innerHTML = `
        <button class="delete-btn">&#128465;</button>
        <input type="text" class="input-field" placeholder="New Field">
    `;
    document.querySelector('.form').insertBefore(newInputGroup, document.querySelector('.add-input-field'));
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        event.target.parentElement.remove();
    }
});

document.getElementById('coverImage').addEventListener('change', function() {
    const indicator = document.getElementById('uploadIndicator');
    if (this.files && this.files.length > 0) {
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
});
