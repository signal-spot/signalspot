import Flutter
import UIKit
import GoogleMaps
import FirebaseCore
import FirebaseAuth
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    
    // Firebase 초기화
    FirebaseApp.configure()
    
    // Google Maps API 키 설정
    GMSServices.provideAPIKey("AIzaSyAw50OEwJ6D3FiotDuB_l49nkDc-GFVr5A")
    
    // 알림 권한 설정 (iOS 10+)
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
      let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
      UNUserNotificationCenter.current().requestAuthorization(
        options: authOptions,
        completionHandler: { _, _ in }
      )
    }
    
    application.registerForRemoteNotifications()
    
    // Flutter 플러그인 등록
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  // URL 스킴 처리 (전화번호 인증에 필요)
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    if Auth.auth().canHandle(url) {
      print("URL handled by Firebase Auth")
      return true
    }
    return super.application(app, open: url, options: options)
  }
  
  // iOS 10+: 포그라운드에서 알림 표시
  @available(iOS 10.0, *)
  override func userNotificationCenter(_ center: UNUserNotificationCenter,
                                      willPresent notification: UNNotification,
                                      withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    // 포그라운드에서도 알림 표시 (배너, 소리, 배지)
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .sound, .badge])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
}