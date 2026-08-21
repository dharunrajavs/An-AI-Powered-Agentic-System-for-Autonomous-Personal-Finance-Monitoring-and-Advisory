Pod::Spec.new do |s|
  s.name           = 'SmsReaderModule'
  s.version        = '1.0.0'
  s.summary        = 'SMS Reader module for Expo'
  s.homepage       = 'https://docs.expo.dev'
  s.license        = 'MIT'
  s.author         = 'FinSense'
  s.platform       = :ios, '15.0'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  if !$ExpoUseSources&.include?(s.name) && ENV['EXPO_USE_SOURCES'].to_i == 0 && File.exist?("#{s.name}.xcframework")
    s.vendored_frameworks = "#{s.name}.xcframework"
  else
    s.source_files = '**/*.{h,m,swift}'
  end
end
