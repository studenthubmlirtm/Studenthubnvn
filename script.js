uploadBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please choose a file.");
        return;
    }

    // Allow only PDF, PPT, PPTX
    const allowed = [".pdf", ".ppt", ".pptx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(ext)) {
        alert("Only PDF, PPT and PPTX files are allowed.");
        return;
    }

    // Maximum 20 MB
    if (file.size > 20 * 1024 * 1024) {
        alert("File size must be less than 20 MB.");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const path = Date.now() + "_" + file.name;

    // Upload file to Storage
    const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(path, file);

    if (uploadError) {
        alert(uploadError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
        return;
    }

    // Get public URL
    const { data } = supabase.storage
        .from("notes")
        .getPublicUrl(path);

    // Save file info in database
    const { error: insertError } = await supabase
        .from("notes")
        .insert({
            file_name: file.name,
            file_url: data.publicUrl,
            uploaded_by: studentName.value.trim() || "Anonymous"
        });

    if (insertError) {
        alert(insertError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload";
        return;
    }

    alert("Upload successful!");

    fileInput.value = "";
    studentName.value = "";

    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";

    loadFiles();
});
