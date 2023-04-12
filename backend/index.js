const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mysql = require("mysql");

dotenv.config();

const token_secret = process.env.TOKEN_SECRET;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
	host: "localhost",
	user: "furre",
	password: "furre",
	database: "chas_banksajt",
	port: 8889
})



function generateAccessToken(userId) {
	return jwt.sign({ id: userId }, token_secret);
}

app.post("/create-user", async (req, res) => {
	const input = req.body;
	const { username, password, balance } = input;
	console.log(username + " " + password)
	const userId = uuid();

	connection.query("INSERT INTO `users`(`id`, `username`, `password`) VALUES ('" + userId + "','" + username + "','" + password + "')", (err, result) => {
		if (err) {
			console.log(err)
		}
	})

	const bankAccountId = uuid();
	connection.query("INSERT INTO `bank_accounts`(`id`, `userId`, `balance`) VALUES ('" + bankAccountId + "','" + userId + "','" + balance + "')", (err, result) => {
		if (err) {
			console.log(err)
		}
	})

	const accessToken = generateAccessToken(userId);

	return res.status(200).json({ access_token: accessToken });
});

app.post("/login-user", (req, res) => {
	const { username, password } = req.body;

	connection.query("SELECT * FROM `users`", (err, result) => {
		if (err) {
			console.log(err)
		} else {
			const user = result.find((user) => user.username === username && user.password === password
			);
			if (!user) {
				return res.status(403).json({
					error: "No user with that username or password has been found :(",
				});
			}
			console.log(user.id)
			const accessToken = generateAccessToken(user.id);

			return res.status(200).json({ access_token: accessToken });

		}
	});
});

function authenticateTokenMiddleware(req, res, next) {
	const accessToken = req.headers.authorization.split(" ")[1];
	if (!accessToken) {
		return res.status(401).json({
			error: "No access token",
		});
	}

	jwt.verify(
		accessToken,
		process.env.TOKEN_SECRET,
		async (error, decodedToken) => {
			if (error) {
				return res.sendStatus(403).json({
					error: "Unauthorized, couldn't verify token",
				});
			}

			connection.query("SELECT * FROM `users`", (err, result) => {
				if (err) {
					console.log(err)
				} else {
					const user = result.find((user) => user.id === decodedToken.id);

					if (!user) {
						return res.sendStatus(403).json({
							error: "Unauthorized, couldn't find user",
						});
					}

					req.user = user;

					next();
				}
			})


		},
	);
}

app.get("/me", authenticateTokenMiddleware, async (req, res) => {
	const user = req.user;

	connection.query("SELECT * FROM `bank_accounts`", (err, result) => {
		if (err) {
			console.log(err)
		} else {
			const account = result.find((account) => account.userId === user.id);
			return res.status(200).json({ account, user });
		}
	})



});


connection.connect((err, result) => {
	if (err) {
		console.log(err)
	} else {
		app.listen(5000);
	}
})