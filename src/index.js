document.addEventListener("DOMContentLoaded", () => {
    const fetchUrl = "http://localhost:3000/quotes?_embed=likes";
    const list = document.getElementById('quote-list');
    const postUrl = "http://localhost:3000/quotes";
    const likesUrl = "http://localhost:3000/likes";
    const deleteUrl = "http://localhost:3000/quotes";
    const submit = document.getElementById('submitNew');

    // Function to generate HTML for a quotation
    function createQuotationHTML(quotationText, author, id) {
        const listHtml = document.createElement('li');
        listHtml.id = `${id}`
        listHtml.innerHTML = `
            <blockquote class="blockquote">
                <p class="mb-0">${quotationText}</p>
                <footer class="blockquote-footer">${author}</footer>
                <br>
                <button class='btn-success' data-quote-id="${id}">Likes: <span>0</span></button>
                <button class='btn-danger'>Delete</button>
            </blockquote>`;
        return listHtml;
    }

    fetch(fetchUrl)
        .then((res) => res.json())
        .then((data) => {
            data.forEach((item) => {
                const quotationText = item.quote;
                const author = item.author;
                const id = item.id;
                const quotationHtml = createQuotationHTML(quotationText, author, id);
                list.appendChild(quotationHtml);

                const deleteBtns = document.querySelectorAll('.btn-danger');

                deleteBtns.forEach(deleteBtn => {
                    deleteBtn.addEventListener('click', handleDelete);
                });

                const likeBtns = document.querySelectorAll('.btn-success');
                likeBtns.forEach((likeBtn) => {
                    likeBtn.addEventListener('click', handleLike)
                })
            });

            submit.addEventListener('click', handleSubmit);

            // POST request to add a new quotation
            function handleSubmit(e) {
                e.preventDefault();
                const quote = document.getElementById('new-quote');
                const quoteText = quote.value;
                const author = document.getElementById('author');
                const authorText = author.value;

                const dbToPost = {
                    "quote": quoteText,
                    "author": authorText
                };

                fetch(postUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(dbToPost),
                })
                    .then((res) => res.json())
                    .then((newData) => {
                        console.log("New data added:", newData);

                        // Generate HTML for the new quotation and append it to the list
                        const newQuotationHtml = createQuotationHTML(newData.quote, newData.author, newData.id);
                        list.appendChild(newQuotationHtml);

                        // Clear input fields
                        quote.value = '';
                        author.value = '';
                    })
                    .catch((error) => {
                        console.error("Error adding new data:", error);
                    });
            }

        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });

    // DELETE
    function handleDelete() {
        const liToDelete = this.closest("li"); // Replace with the actual ID to delete
        const idToDelete = liToDelete.id;
        console.log(idToDelete);
        fetch(`${deleteUrl}/${idToDelete}`, {
            method: "DELETE",
        })
            .then(response => {
                if (response.ok) {
                    // Handle success
                    return response.json();
                } else {
                    throw new Error("Delete operation failed");
                }
            })
            .then(data => {
                console.log("Delete operation successful:", data);

                liToDelete.remove();
            })
            .catch(error => {
                console.error("Error deleting data:", error);
            });
    }

    // POST (to add likes)
    function handleLike() {
        const quoteId = this.getAttribute("data-quote-id"); // Get the quote ID from the button's data attribute

        const data = {
            quoteId: parseInt(quoteId) // Parse the quote ID to an integer
        };

        fetch(likesUrl, {
            method: "POST", // Use POST to add a new like
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data), // Send the JSON data
        })
            .then(response => response.json()) // Parse response
            .then(data => {
                // Handle response data
                const likeToUpdate = this.querySelector("span");
                const currentLikes = parseInt(likeToUpdate.textContent);
                const newLikes = currentLikes + 1;
                likeToUpdate.textContent = newLikes;
            })
            .catch(error => {
                console.error("Error adding like:", error);
            });
    }
});
