const supabaseUrl = "https://jnojdhyulyxzzgozhxmo.supabase.co";
const supabaseKey = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const studentName = document.getElementById("studentName");
const fileList = document.getElementById("fileList");
const search = document.getElementById("search");

async function loadFiles() {

    let { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        fileList.innerHTML = "Unable to load files.";
        return;
    }

    showFiles(data);
}

function showFiles(files) {

    const keyword = search.value.toLowerCase();

    fileList.innerHTML = "";

    files.forEach(file => {

        if (!file.file_name.toLowerCase().includes(keyword))
            return;

        fileList.innerHTML += `
        <div class="file">
            <b>${file.file_name}</b><br>
            Uploaded by: ${file.uploaded_by || "Anonymous"}<br><br>

            <a href="${file.file_url}" target="_blank">
                <button class="btn preview">Preview</button>
            </a>

            <a href="${file.file_url}" download>
                <button class="btn download">Download</button>
            </a>
        </div>
        `;
    });
}

search.addEventListener("input", loadFiles);

uploadBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Choose a file.");
        return;
    }

    const path = Date.now() + "_" + file.name;

    const { error: uploadError } =
        await supabase.storage
            .from("notes")
            .upload(path, file);

    if (uploadError) {
        alert(uploadError.message);
        return;
    }

    const { data } =
        supabase.storage
            .from("notes")
            .getPublicUrl(path);

    await supabase
        .from("notes")
        .insert({
            file_name: file.name,
            file_url: data.publicUrl,
            uploaded_by: studentName.value
        });

    alert("Upload successful.");

    fileInput.value = "";

    loadFiles();
});

loadFiles();
