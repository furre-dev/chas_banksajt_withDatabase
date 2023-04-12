import { useEffect, useState } from "react";
import Cookies from "js-cookie";

function App() {
	const [signUpUsernameInput, setSignUpUsernameInput] = useState("");
	const [signUpPasswordInput, setSignUpPasswordInput] = useState("");
	const [signUpBalanceInput, setSignUpBalanceInput] = useState();

	const [signInUsernameInput, setSignInUsernameInput] = useState("");
	const [signInPasswordInput, setSignInPasswordInput] = useState("");

	const [userData, setUserData] = useState(null);
	const [accountData, setAccountData] = useState(null);

	async function handleCreateUser() {
		try {
			setUserData(null);
			setAccountData(null);

			const res = await fetch("http://localhost:5000/create-user", {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					username: signUpUsernameInput,
					password: signUpPasswordInput,
					balance: signUpBalanceInput,
				}),
			});

			const data = await res.json();

			if (data.access_token) {
				Cookies.set("access_token", data.access_token, { expires: 365 });
				setUserData(data.user);
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function handleLoginUser() {
		try {
			setUserData(null);
			setAccountData(null);

			const res = await fetch("http://localhost:5000/login-user", {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					username: signInUsernameInput,
					password: signInPasswordInput,
				}),
			});

			const data = await res.json();

			if (data.access_token) {
				Cookies.set("access_token", data.access_token, { expires: 365 });
				updateData();
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function handleLogout() {
		Cookies.remove("access_token");
		setUserData(null);
		setAccountData(null);
		setSignInUsernameInput("");
		setSignInPasswordInput("");
	}

	async function updateData() {
		try {
			const accessToken = Cookies.get("access_token");

			const res = await fetch("http://localhost:5000/me", {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await res.json();

			setUserData(data.user);
			setAccountData(data.account);
		} catch (error) {
			setUserData(null);
			setAccountData(null);
		}
	}

	useEffect(() => {
		const accessToken = Cookies.get("access_token");
		if (accessToken && userData === null) {
			updateData();
		}
	}, []);

	return (
		<main className="w-screen h-screen flex justify-center items-center space-x-10">
			{/* Sign Up */}
			<section className="flex flex-col w-max space-y-3 justify-center items-center">
				<h1 className="text-2xl">Sign Up</h1>
				<input
					onChange={(e) => setSignUpUsernameInput(e.target.value)}
					value={signUpUsernameInput}
					className="p-1 rounded-lg border border-black"
					placeholder="Username"
				/>
				<input
					onChange={(e) => setSignUpPasswordInput(e.target.value)}
					value={signUpPasswordInput}
					className="p-1 rounded-lg border border-black"
					placeholder="Password"
					type={"password"}
				/>
				<input
					onChange={(e) => setSignUpBalanceInput(e.target.value)}
					value={signUpBalanceInput}
					type={"number"}
					className="p-1 rounded-lg border border-black"
					placeholder="Balance"
				/>
				<button
					className="bg-red-400 px-2 py-1 text-white rounded-lg"
					onClick={() => handleCreateUser()}
				>
					Sign Up!
				</button>
			</section>

			{/* Vertical Divider */}
			<div className="h-[300px] w-[1px] bg-black" />

			{/* Sign In */}
			<section className="flex flex-col justify-center items-center space-y-3">
				<h1 className="text-2xl">Sign In</h1>
				<input
					className="p-1 rounded-lg border border-black"
					placeholder="Username"
					value={signInUsernameInput || userData?.username || ""}
					onChange={(e) => setSignInUsernameInput(e.target.value)}
				/>
				<input
					className="p-1 rounded-lg border border-black"
					placeholder="Password"
					type={"password"}
					value={signInPasswordInput || userData?.password || ""}
					onChange={(e) => setSignInPasswordInput(e.target.value)}
				/>
				{!userData ? (
					<button
						onClick={() => handleLoginUser()}
						className="bg-red-500 px-2 py-1 text-white rounded-lg"
					>
						Sign In
					</button>
				) : (
					<button className="bg-green-500 px-2 py-1 text-white rounded-lg">
						Logged in
					</button>
				)}

				{userData ? (
					<div className="flex flex-col items-center">
						<p>Balance: ${accountData?.balance || ""}</p>
					</div>
				) : (
					<div className="hidden">
						<p>Balance: {accountData?.balance || ""}</p>
					</div>
				)}

				{userData && (
					<button
						className="bg-blue-500 px-2 py-1 text-white rounded-lg"
						onClick={() => handleLogout()}
					>
						Log out
					</button>
				)}
			</section>
		</main>
	);
}

export default App;
