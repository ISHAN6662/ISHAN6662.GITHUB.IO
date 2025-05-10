const readline = require('readline-sync');
const mysql = require('mysql2/promise');

// MySQL Connection Setup
let connection;
async function connectToDatabase() {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'ISHAN6662',
        database: 'railway_db'
    });
    console.log("Connected to MySQL.");
}

// Sign Up Function
async function signUp() {
    console.log("Sign Up:");
    const firstName = readline.question("Enter First Name: ");
    const lastName = readline.question("Enter Last Name: ");
    const userName = readline.question("Enter Username: ");
    const password = readline.question("Enter Password: ");
    const rePassword = readline.question("Re-enter Password: ");

    if (password !== rePassword) {
        console.log("Passwords do not match. Try signing up again.");
        return;
    }

    const phone = readline.question("Enter Phone Number: ");
    const gender = readline.question("Enter Gender (M/F/N): ");
    const dob = readline.question("Enter Date of Birth (YYYY-MM-DD): ");
    const age = parseInt(readline.question("Enter Age: "), 10);

    const query = `
        INSERT INTO user_accounts 
        (first_name, last_name, user_name, password, phone_no, gender, dob, age)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [firstName, lastName, userName, password, phone, gender, dob, age]);
    console.log("Account created successfully.");

    const choice = readline.question("Do you want to continue to the main menu? (yes/no): ").toLowerCase();
    if (choice === 'yes') mainMenu();
}

// Sign In Function
async function signIn() {
    console.log("Sign In:");
    const userName = readline.question("Enter Username: ");
    const password = readline.question("Enter Password: ");

    const [rows] = await connection.execute(
        "SELECT * FROM user_accounts WHERE user_name = ? AND password = ?",
        [userName, password]
    );

    if (rows.length > 0) {
        console.log(`Sign-in successful. Welcome, ${userName}!`);
        await userMenu(userName);
    } else {
        console.log("Invalid username or password. Please try again.");
    }
}

// User Menu
async function userMenu(userName) {
    while (true) {
        console.log("\nUser Menu:");
        console.log("1. Book Ticket");
        console.log("2. Check Bookings");
        console.log("3. Delete Booking");
        console.log("4. Delete Account");
        console.log("5. Logout");

        const choice = parseInt(readline.question("Enter your choice: "), 10);
        if (choice === 1) await bookTicket(userName);
        else if (choice === 2) await checkBookings(userName);
        else if (choice === 3) await deleteBooking(userName);
        else if (choice === 4) {
            await deleteAccount(userName);
            break;
        } else if (choice === 5) {
            console.log("Logging out.");
            break;
        } else {
            console.log("Invalid choice. Please try again.");
        }
    }
}

// Book Ticket
async function bookTicket(userName) {
    console.log("Booking a ticket...");
    const details = readline.question("Enter booking details: ");
    await connection.execute(
        "INSERT INTO bookings (user_name, booking_details) VALUES (?, ?)",
        [userName, details]
    );
    console.log("Ticket booked successfully.");
}

// Check Bookings
async function checkBookings(userName) {
    console.log("Checking bookings...");
    const [rows] = await connection.execute(
        "SELECT booking_id, booking_details FROM bookings WHERE user_name = ?",
        [userName]
    );

    if (rows.length > 0) {
        rows.forEach(row => {
            console.log(`Booking ID: ${row.booking_id}, Details: ${row.booking_details}`);
        });
    } else {
        console.log("No bookings found.");
    }
}

// Delete Booking
async function deleteBooking(userName) {
    const bookingId = readline.question("Enter the Booking ID to delete: ");
    await connection.execute(
        "DELETE FROM bookings WHERE booking_id = ? AND user_name = ?",
        [bookingId, userName]
    );
    console.log("Booking deleted, if it existed.");
}

// Delete Account
async function deleteAccount(userName = null) {
    if (!userName) {
        userName = readline.question("Enter your Username: ");
        const password = readline.question("Enter your Password: ");
        const [rows] = await connection.execute(
            "SELECT * FROM user_accounts WHERE user_name = ? AND password = ?",
            [userName, password]
        );
        if (rows.length === 0) {
            console.log("Invalid credentials. Cannot delete account.");
            return;
        }
    }

    await connection.execute("DELETE FROM user_accounts WHERE user_name = ?", [userName]);
    await connection.execute("DELETE FROM bookings WHERE user_name = ?", [userName]);
    console.log("Account and associated bookings deleted successfully.");
}

// Main Menu
async function mainMenu() {
    while (true) {
        console.log("\nRailway Reservation System Main Menu");
        console.log("1. Sign In");
        console.log("2. Sign Up");
        console.log("3. Exit");

        const choice = parseInt(readline.question("Enter your choice: "), 10);
        if (choice === 1) await signIn();
        else if (choice === 2) await signUp();
        else if (choice === 3) {
            console.log("Thank you for using the Railway Reservation System.");
            process.exit(0);
        } else {
            console.log("Invalid choice. Please try again.");
        }
    }
}

// Start the application
connectToDatabase().then(mainMenu).catch(err => {
    console.error("Failed to connect to the database:", err);
});
