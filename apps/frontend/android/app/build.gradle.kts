plugins {
    id("com.android.application")
    // START: FlutterFire Configuration
    id("com.google.gms.google-services")
    // END: FlutterFire Configuration
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.signalspot.frontend"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.signalspot.frontend"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 23  // Android 6.0+ for background location
        targetSdk = 34  // Android 14
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        
        // .env 파일에서 Kakao API Key 읽기
        val envFile = File(project.rootDir.parentFile, ".env")
        val kakaoApiKey = if (envFile.exists()) {
            val envContent = envFile.readText()
            val kakaoKeyLine = envContent.lines().find { it.startsWith("KAKAO_NATIVE_APP_KEY=") }
            kakaoKeyLine?.substringAfter("=") ?: "df814bedea193627d18fd8026c99ca2d"
        } else {
            "df814bedea193627d18fd8026c99ca2d"
        }
        manifestPlaceholders["KAKAO_NATIVE_APP_KEY"] = kakaoApiKey
        
        println("Using Kakao Native App Key: $kakaoApiKey")
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}
