# Asritha's World ✨ | Premium Cinematic MERN Birthday Universe

Welcome to **Asritha's World**, a luxury, high-end digital universe created as a birthday tribute. It combines modern Glassmorphism, 3D stars, Three.js objects, custom cursor trails, email OTP resets, and a MERN stack photo-memory manager to construct an emotional, cinematic celebration experience.

---

## 🚀 Quick Start (Instant Run/Offline Mode)

We have built a **zero-configuration offline fallback** into the application. If you don't have MongoDB or Cloudinary keys set up, the application will automatically fall back to an in-memory JSON file store on the server, local file uploads to the backend folder, and a mock verification email service.

### 1. Install Dependencies
Run the installation script in the root directory to set up both frontend and backend:
```bash
npm run install-all
```

### 2. Boot Up the Servers
Start both the React development server and the Node.js API server concurrently:
```bash
npm run dev
```

### 3. Log In to the World
* **URL**: `http://localhost:5173`
* **Default Seed Email**: `asritha@world.com`
* **Default Seed Password**: `asritha123`
* **Forgot Password OTP (Offline Mode)**: Enter any 6-digit code (e.g. `123456`) in the boxes to verify and reset!

---

## 🛠️ Stack & Design System

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, GSAP, Three.js (3D Birthday Cake)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas (Mongoose) / Local JSON fallback
* **Auth**: JSON Web Tokens (JWT)
* **Email Service**: Nodemailer SMTP / Server console log fallback
* **Image Hosting**: Cloudinary / Local uploads directory fallback

### Color Palette & Visuals
* **Deep Midnight Blue**: `#0f172a` (Primary sky canvas)
* **Purple Aurora**: `#7c3aed` (Glows & transitions)
* **Pink Glow**: `#ec4899` (Confetti & highlights)
* **Gold Highlights**: `#fbbf24` (Stars & lanterns)
* **White Frost**: `#ffffff` (Text & cards)

---

## 🎨 Cinematic Page Flow

1. **Page 1: Magic Welcome Screen**: Slow-drifting clouds and a glowing moon, typing hello arpeggios, heart explosions, and a warp tunnel space zoom.
2. **Page 2: Login Page**: Glassmorphism cards with glowing inputs and a 6-digit verification OTP flow to reset passwords.
3. **Page 3: World Entry Animation**: Zooming starfields with 1,500 particles converging to spell **ASRITHA** before dissolving.
4. **Page 4: Friendship Journey**: Parallax timeline tracking key steps, ending with a massive Happy Birthday card, Three.js rotating cake, and customizable Snow/Lantern/Fireworks HUD toggles.
5. **Page 5: Memory Album**: Pinterest-style masonry grid supporting CRUD uploads, chronological filtering, and an autoplay Slideshow Mode.
6. **Page 6: Surprise Feedback**: Star rating triggers floating hearts rising and custom confetti bursts.
7. **Page 7: Final Screen**: Slow starry night typing emotional wishes, concluding with stars congregating to write **"Made With ❤️ By Teja"**.

---

## ⚙️ Configuration (Production/Online Mode)

When you are ready to deploy or use MongoDB/Cloudinary:
1. Open the [backend/.env](file:///c:/Users/Teja/OneDrive/Desktop/Education/MERN/BirthdaySuprise/backend/.env) file.
2. Provide your credentials:

```ini
# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/asrithas_world

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer SMTP (Gmail app passwords, etc.)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

3. Restart the server: `npm run dev`. It will output:
   * `Connected to MongoDB Atlas: <host>`
   * OTP codes will now be sent directly to the email!
   * Image uploads will be hosted on Cloudinary!

---

## 📱 Mobile Testing

Because Vite is configured with `host: true`, you can test it on your mobile phone or tablet:
1. Ensure your PC and mobile device are connected to the same Wi-Fi network.
2. Find your PC's local IP address (e.g. `192.168.1.45`).
3. Open `http://192.168.1.45:5173` on your mobile browser.
4. Experience the premium cinematic layout, swipe slideshows, and tap buttons with 60 FPS fluidity!
