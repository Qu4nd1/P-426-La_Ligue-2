<script setup>
import { ref, onMounted, reactive } from "vue";
import { verifyUser } from "../../services/userAuth";

// Login personne
const user = reactive({
	email: "",
	pwd: "",
});

const login = async () => {
	const result = await verifyUser(user);

	if (result) {
		console.log("Connexion réussie :", result);
	} else {
		console.log("Email ou mot de passe incorrect");
	}
};

// Animation du texte
const text = "Hello Friend !";
const displayedText = ref("");
let index = 0;
const speed = 100;

function typeWriter() {
	if (index < text.length) {
		displayedText.value += text.charAt(index);
		index++;
		setTimeout(typeWriter, speed);
	}
}

onMounted(() => {
	typeWriter();
});
</script>

<template>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
		rel="stylesheet"
	/>

	<body>
		<div class="container">
			<div class="sign-in">
				<form @submit.prevent="login">
					<div class="typing">
						<h1>{{ displayedText }}</h1>
					</div>
					<div class="social-icons">
						<!-- <a href="#" class="icon"><i class="fa-brands fa-google"></i></a>
						<a href="#" class="icon"><i class="fa-brands fa-github"></i></a>
						<a href="#" class="icon"><i class="fa-brands fa-facebook"></i></a>
						<a href="#" class="icon"><i class="fa-brands fa-discord"></i></a> -->
					</div>
					<!-- <span>or log in with your Email</span> -->
					<input
						type="email"
						id="email"
						placeholder="Email"
						v-model="user.email"
					/>
					<input
						type="password"
						id="password"
						placeholder="Password"
						v-model="user.pwd"
					/>
					<button>Sign In</button>
				</form>
			</div>
		</div>
	</body>
</template>
<style>
* {
	margin: 0;
	padding: 0;
	font-family: "Ubuntu";
	box-sizing: border-box;
}

body {
	background: linear-gradient(to right, #928dda, #00d4ff);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	height: 100vh;
}
</style>
<style scoped>
.container {
	background-color: #fff;
	border-radius: 30px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
	position: relative;
	overflow: hidden;
	width: 768px;
	max-width: 100%;
	min-height: 480px;
}

.container span {
	font-size: 12px;
}

.container a {
	color: #000000;
	font-size: 13px;
	text-decoration: none;
	margin: 15px 0 10px;
}

.container button {
	background-color: #512da8;
	color: #fff;
	font-size: 12px;
	padding: 10px 45px;
	border: 1px solid transparent;
	border-radius: 8px;
	font-weight: 600;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	margin-top: 10px;
	cursor: pointer;
}

.container form {
	background-color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 0 40px;
	height: 100%;
}

.container input {
	background-color: #eee;
	border: none;
	margin: 8px 0;
	padding: 10px 15px;
	font-size: 13px;
	border-radius: 8px;
	width: 100%;
	outline: none;
}

.sign-in {
	height: 100%;
}

.social-icons {
	margin: 20px 0;
}

.social-icons a {
	border: 1px solid #ccc;
	border-radius: 20%;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	margin: 0 3px;
	width: 40px;
	height: 40px;
}

.typing {
	font-family: "Ubuntu";
	font-size: 24px;
	white-space: nowrap;
	overflow: hidden;
	border-right: 0.15em solid #000; /* cursor effect */
	animation: blink-caret 0.75s step-end infinite;
}

@keyframes blink-caret {
	from,
	to {
		border-color: transparent;
	}
	50% {
		border-color: black;
	}
}
</style>
