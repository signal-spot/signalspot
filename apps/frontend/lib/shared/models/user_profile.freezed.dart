// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_profile.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

UserProfile _$UserProfileFromJson(Map<String, dynamic> json) {
  return _UserProfile.fromJson(json);
}

/// @nodoc
mixin _$UserProfile {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String? get displayName => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  String? get avatarUrl => throw _privateConstructorUsedError;
  DateTime? get birthDate => throw _privateConstructorUsedError;
  String? get location => throw _privateConstructorUsedError;
  List<String>? get interests => throw _privateConstructorUsedError;
  ProfileVisibility get visibility => throw _privateConstructorUsedError;
  SignatureConnectionPreferences? get signatureConnection =>
      throw _privateConstructorUsedError;
  ProfileSettings? get settings => throw _privateConstructorUsedError;
  ProfileStats? get stats => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this UserProfile to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserProfileCopyWith<UserProfile> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserProfileCopyWith<$Res> {
  factory $UserProfileCopyWith(
    UserProfile value,
    $Res Function(UserProfile) then,
  ) = _$UserProfileCopyWithImpl<$Res, UserProfile>;
  @useResult
  $Res call({
    String id,
    String userId,
    String? displayName,
    String? bio,
    String? avatarUrl,
    DateTime? birthDate,
    String? location,
    List<String>? interests,
    ProfileVisibility visibility,
    SignatureConnectionPreferences? signatureConnection,
    ProfileSettings? settings,
    ProfileStats? stats,
    DateTime createdAt,
    DateTime updatedAt,
  });

  $SignatureConnectionPreferencesCopyWith<$Res>? get signatureConnection;
  $ProfileSettingsCopyWith<$Res>? get settings;
  $ProfileStatsCopyWith<$Res>? get stats;
}

/// @nodoc
class _$UserProfileCopyWithImpl<$Res, $Val extends UserProfile>
    implements $UserProfileCopyWith<$Res> {
  _$UserProfileCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? displayName = freezed,
    Object? bio = freezed,
    Object? avatarUrl = freezed,
    Object? birthDate = freezed,
    Object? location = freezed,
    Object? interests = freezed,
    Object? visibility = null,
    Object? signatureConnection = freezed,
    Object? settings = freezed,
    Object? stats = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            displayName: freezed == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            avatarUrl: freezed == avatarUrl
                ? _value.avatarUrl
                : avatarUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            birthDate: freezed == birthDate
                ? _value.birthDate
                : birthDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            location: freezed == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String?,
            interests: freezed == interests
                ? _value.interests
                : interests // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            visibility: null == visibility
                ? _value.visibility
                : visibility // ignore: cast_nullable_to_non_nullable
                      as ProfileVisibility,
            signatureConnection: freezed == signatureConnection
                ? _value.signatureConnection
                : signatureConnection // ignore: cast_nullable_to_non_nullable
                      as SignatureConnectionPreferences?,
            settings: freezed == settings
                ? _value.settings
                : settings // ignore: cast_nullable_to_non_nullable
                      as ProfileSettings?,
            stats: freezed == stats
                ? _value.stats
                : stats // ignore: cast_nullable_to_non_nullable
                      as ProfileStats?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SignatureConnectionPreferencesCopyWith<$Res>? get signatureConnection {
    if (_value.signatureConnection == null) {
      return null;
    }

    return $SignatureConnectionPreferencesCopyWith<$Res>(
      _value.signatureConnection!,
      (value) {
        return _then(_value.copyWith(signatureConnection: value) as $Val);
      },
    );
  }

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ProfileSettingsCopyWith<$Res>? get settings {
    if (_value.settings == null) {
      return null;
    }

    return $ProfileSettingsCopyWith<$Res>(_value.settings!, (value) {
      return _then(_value.copyWith(settings: value) as $Val);
    });
  }

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ProfileStatsCopyWith<$Res>? get stats {
    if (_value.stats == null) {
      return null;
    }

    return $ProfileStatsCopyWith<$Res>(_value.stats!, (value) {
      return _then(_value.copyWith(stats: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$UserProfileImplCopyWith<$Res>
    implements $UserProfileCopyWith<$Res> {
  factory _$$UserProfileImplCopyWith(
    _$UserProfileImpl value,
    $Res Function(_$UserProfileImpl) then,
  ) = __$$UserProfileImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String userId,
    String? displayName,
    String? bio,
    String? avatarUrl,
    DateTime? birthDate,
    String? location,
    List<String>? interests,
    ProfileVisibility visibility,
    SignatureConnectionPreferences? signatureConnection,
    ProfileSettings? settings,
    ProfileStats? stats,
    DateTime createdAt,
    DateTime updatedAt,
  });

  @override
  $SignatureConnectionPreferencesCopyWith<$Res>? get signatureConnection;
  @override
  $ProfileSettingsCopyWith<$Res>? get settings;
  @override
  $ProfileStatsCopyWith<$Res>? get stats;
}

/// @nodoc
class __$$UserProfileImplCopyWithImpl<$Res>
    extends _$UserProfileCopyWithImpl<$Res, _$UserProfileImpl>
    implements _$$UserProfileImplCopyWith<$Res> {
  __$$UserProfileImplCopyWithImpl(
    _$UserProfileImpl _value,
    $Res Function(_$UserProfileImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? displayName = freezed,
    Object? bio = freezed,
    Object? avatarUrl = freezed,
    Object? birthDate = freezed,
    Object? location = freezed,
    Object? interests = freezed,
    Object? visibility = null,
    Object? signatureConnection = freezed,
    Object? settings = freezed,
    Object? stats = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$UserProfileImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        displayName: freezed == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        avatarUrl: freezed == avatarUrl
            ? _value.avatarUrl
            : avatarUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        birthDate: freezed == birthDate
            ? _value.birthDate
            : birthDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        location: freezed == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String?,
        interests: freezed == interests
            ? _value._interests
            : interests // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        visibility: null == visibility
            ? _value.visibility
            : visibility // ignore: cast_nullable_to_non_nullable
                  as ProfileVisibility,
        signatureConnection: freezed == signatureConnection
            ? _value.signatureConnection
            : signatureConnection // ignore: cast_nullable_to_non_nullable
                  as SignatureConnectionPreferences?,
        settings: freezed == settings
            ? _value.settings
            : settings // ignore: cast_nullable_to_non_nullable
                  as ProfileSettings?,
        stats: freezed == stats
            ? _value.stats
            : stats // ignore: cast_nullable_to_non_nullable
                  as ProfileStats?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserProfileImpl implements _UserProfile {
  const _$UserProfileImpl({
    required this.id,
    required this.userId,
    this.displayName,
    this.bio,
    this.avatarUrl,
    this.birthDate,
    this.location,
    final List<String>? interests,
    this.visibility = ProfileVisibility.public,
    this.signatureConnection,
    this.settings,
    this.stats,
    required this.createdAt,
    required this.updatedAt,
  }) : _interests = interests;

  factory _$UserProfileImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserProfileImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final String? displayName;
  @override
  final String? bio;
  @override
  final String? avatarUrl;
  @override
  final DateTime? birthDate;
  @override
  final String? location;
  final List<String>? _interests;
  @override
  List<String>? get interests {
    final value = _interests;
    if (value == null) return null;
    if (_interests is EqualUnmodifiableListView) return _interests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final ProfileVisibility visibility;
  @override
  final SignatureConnectionPreferences? signatureConnection;
  @override
  final ProfileSettings? settings;
  @override
  final ProfileStats? stats;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'UserProfile(id: $id, userId: $userId, displayName: $displayName, bio: $bio, avatarUrl: $avatarUrl, birthDate: $birthDate, location: $location, interests: $interests, visibility: $visibility, signatureConnection: $signatureConnection, settings: $settings, stats: $stats, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserProfileImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl) &&
            (identical(other.birthDate, birthDate) ||
                other.birthDate == birthDate) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(
              other._interests,
              _interests,
            ) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.signatureConnection, signatureConnection) ||
                other.signatureConnection == signatureConnection) &&
            (identical(other.settings, settings) ||
                other.settings == settings) &&
            (identical(other.stats, stats) || other.stats == stats) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    displayName,
    bio,
    avatarUrl,
    birthDate,
    location,
    const DeepCollectionEquality().hash(_interests),
    visibility,
    signatureConnection,
    settings,
    stats,
    createdAt,
    updatedAt,
  );

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserProfileImplCopyWith<_$UserProfileImpl> get copyWith =>
      __$$UserProfileImplCopyWithImpl<_$UserProfileImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserProfileImplToJson(this);
  }
}

abstract class _UserProfile implements UserProfile {
  const factory _UserProfile({
    required final String id,
    required final String userId,
    final String? displayName,
    final String? bio,
    final String? avatarUrl,
    final DateTime? birthDate,
    final String? location,
    final List<String>? interests,
    final ProfileVisibility visibility,
    final SignatureConnectionPreferences? signatureConnection,
    final ProfileSettings? settings,
    final ProfileStats? stats,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) = _$UserProfileImpl;

  factory _UserProfile.fromJson(Map<String, dynamic> json) =
      _$UserProfileImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  String? get displayName;
  @override
  String? get bio;
  @override
  String? get avatarUrl;
  @override
  DateTime? get birthDate;
  @override
  String? get location;
  @override
  List<String>? get interests;
  @override
  ProfileVisibility get visibility;
  @override
  SignatureConnectionPreferences? get signatureConnection;
  @override
  ProfileSettings? get settings;
  @override
  ProfileStats? get stats;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of UserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserProfileImplCopyWith<_$UserProfileImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SignatureConnectionPreferences _$SignatureConnectionPreferencesFromJson(
  Map<String, dynamic> json,
) {
  return _SignatureConnectionPreferences.fromJson(json);
}

/// @nodoc
mixin _$SignatureConnectionPreferences {
  String? get lifeMovie => throw _privateConstructorUsedError;
  String? get favoriteArtist => throw _privateConstructorUsedError;
  String? get mbti => throw _privateConstructorUsedError;
  List<String>? get interests => throw _privateConstructorUsedError;
  String? get memorablePlace => throw _privateConstructorUsedError;
  String? get childhoodMemory => throw _privateConstructorUsedError;
  String? get turningPoint => throw _privateConstructorUsedError;
  String? get proudestMoment => throw _privateConstructorUsedError;
  String? get bucketList => throw _privateConstructorUsedError;
  String? get lifeLesson => throw _privateConstructorUsedError;
  bool get showMovie => throw _privateConstructorUsedError;
  bool get showArtist => throw _privateConstructorUsedError;
  bool get showMbti => throw _privateConstructorUsedError;

  /// Serializes this SignatureConnectionPreferences to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SignatureConnectionPreferences
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignatureConnectionPreferencesCopyWith<SignatureConnectionPreferences>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignatureConnectionPreferencesCopyWith<$Res> {
  factory $SignatureConnectionPreferencesCopyWith(
    SignatureConnectionPreferences value,
    $Res Function(SignatureConnectionPreferences) then,
  ) =
      _$SignatureConnectionPreferencesCopyWithImpl<
        $Res,
        SignatureConnectionPreferences
      >;
  @useResult
  $Res call({
    String? lifeMovie,
    String? favoriteArtist,
    String? mbti,
    List<String>? interests,
    String? memorablePlace,
    String? childhoodMemory,
    String? turningPoint,
    String? proudestMoment,
    String? bucketList,
    String? lifeLesson,
    bool showMovie,
    bool showArtist,
    bool showMbti,
  });
}

/// @nodoc
class _$SignatureConnectionPreferencesCopyWithImpl<
  $Res,
  $Val extends SignatureConnectionPreferences
>
    implements $SignatureConnectionPreferencesCopyWith<$Res> {
  _$SignatureConnectionPreferencesCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignatureConnectionPreferences
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lifeMovie = freezed,
    Object? favoriteArtist = freezed,
    Object? mbti = freezed,
    Object? interests = freezed,
    Object? memorablePlace = freezed,
    Object? childhoodMemory = freezed,
    Object? turningPoint = freezed,
    Object? proudestMoment = freezed,
    Object? bucketList = freezed,
    Object? lifeLesson = freezed,
    Object? showMovie = null,
    Object? showArtist = null,
    Object? showMbti = null,
  }) {
    return _then(
      _value.copyWith(
            lifeMovie: freezed == lifeMovie
                ? _value.lifeMovie
                : lifeMovie // ignore: cast_nullable_to_non_nullable
                      as String?,
            favoriteArtist: freezed == favoriteArtist
                ? _value.favoriteArtist
                : favoriteArtist // ignore: cast_nullable_to_non_nullable
                      as String?,
            mbti: freezed == mbti
                ? _value.mbti
                : mbti // ignore: cast_nullable_to_non_nullable
                      as String?,
            interests: freezed == interests
                ? _value.interests
                : interests // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            memorablePlace: freezed == memorablePlace
                ? _value.memorablePlace
                : memorablePlace // ignore: cast_nullable_to_non_nullable
                      as String?,
            childhoodMemory: freezed == childhoodMemory
                ? _value.childhoodMemory
                : childhoodMemory // ignore: cast_nullable_to_non_nullable
                      as String?,
            turningPoint: freezed == turningPoint
                ? _value.turningPoint
                : turningPoint // ignore: cast_nullable_to_non_nullable
                      as String?,
            proudestMoment: freezed == proudestMoment
                ? _value.proudestMoment
                : proudestMoment // ignore: cast_nullable_to_non_nullable
                      as String?,
            bucketList: freezed == bucketList
                ? _value.bucketList
                : bucketList // ignore: cast_nullable_to_non_nullable
                      as String?,
            lifeLesson: freezed == lifeLesson
                ? _value.lifeLesson
                : lifeLesson // ignore: cast_nullable_to_non_nullable
                      as String?,
            showMovie: null == showMovie
                ? _value.showMovie
                : showMovie // ignore: cast_nullable_to_non_nullable
                      as bool,
            showArtist: null == showArtist
                ? _value.showArtist
                : showArtist // ignore: cast_nullable_to_non_nullable
                      as bool,
            showMbti: null == showMbti
                ? _value.showMbti
                : showMbti // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SignatureConnectionPreferencesImplCopyWith<$Res>
    implements $SignatureConnectionPreferencesCopyWith<$Res> {
  factory _$$SignatureConnectionPreferencesImplCopyWith(
    _$SignatureConnectionPreferencesImpl value,
    $Res Function(_$SignatureConnectionPreferencesImpl) then,
  ) = __$$SignatureConnectionPreferencesImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? lifeMovie,
    String? favoriteArtist,
    String? mbti,
    List<String>? interests,
    String? memorablePlace,
    String? childhoodMemory,
    String? turningPoint,
    String? proudestMoment,
    String? bucketList,
    String? lifeLesson,
    bool showMovie,
    bool showArtist,
    bool showMbti,
  });
}

/// @nodoc
class __$$SignatureConnectionPreferencesImplCopyWithImpl<$Res>
    extends
        _$SignatureConnectionPreferencesCopyWithImpl<
          $Res,
          _$SignatureConnectionPreferencesImpl
        >
    implements _$$SignatureConnectionPreferencesImplCopyWith<$Res> {
  __$$SignatureConnectionPreferencesImplCopyWithImpl(
    _$SignatureConnectionPreferencesImpl _value,
    $Res Function(_$SignatureConnectionPreferencesImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignatureConnectionPreferences
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lifeMovie = freezed,
    Object? favoriteArtist = freezed,
    Object? mbti = freezed,
    Object? interests = freezed,
    Object? memorablePlace = freezed,
    Object? childhoodMemory = freezed,
    Object? turningPoint = freezed,
    Object? proudestMoment = freezed,
    Object? bucketList = freezed,
    Object? lifeLesson = freezed,
    Object? showMovie = null,
    Object? showArtist = null,
    Object? showMbti = null,
  }) {
    return _then(
      _$SignatureConnectionPreferencesImpl(
        lifeMovie: freezed == lifeMovie
            ? _value.lifeMovie
            : lifeMovie // ignore: cast_nullable_to_non_nullable
                  as String?,
        favoriteArtist: freezed == favoriteArtist
            ? _value.favoriteArtist
            : favoriteArtist // ignore: cast_nullable_to_non_nullable
                  as String?,
        mbti: freezed == mbti
            ? _value.mbti
            : mbti // ignore: cast_nullable_to_non_nullable
                  as String?,
        interests: freezed == interests
            ? _value._interests
            : interests // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        memorablePlace: freezed == memorablePlace
            ? _value.memorablePlace
            : memorablePlace // ignore: cast_nullable_to_non_nullable
                  as String?,
        childhoodMemory: freezed == childhoodMemory
            ? _value.childhoodMemory
            : childhoodMemory // ignore: cast_nullable_to_non_nullable
                  as String?,
        turningPoint: freezed == turningPoint
            ? _value.turningPoint
            : turningPoint // ignore: cast_nullable_to_non_nullable
                  as String?,
        proudestMoment: freezed == proudestMoment
            ? _value.proudestMoment
            : proudestMoment // ignore: cast_nullable_to_non_nullable
                  as String?,
        bucketList: freezed == bucketList
            ? _value.bucketList
            : bucketList // ignore: cast_nullable_to_non_nullable
                  as String?,
        lifeLesson: freezed == lifeLesson
            ? _value.lifeLesson
            : lifeLesson // ignore: cast_nullable_to_non_nullable
                  as String?,
        showMovie: null == showMovie
            ? _value.showMovie
            : showMovie // ignore: cast_nullable_to_non_nullable
                  as bool,
        showArtist: null == showArtist
            ? _value.showArtist
            : showArtist // ignore: cast_nullable_to_non_nullable
                  as bool,
        showMbti: null == showMbti
            ? _value.showMbti
            : showMbti // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SignatureConnectionPreferencesImpl
    implements _SignatureConnectionPreferences {
  const _$SignatureConnectionPreferencesImpl({
    this.lifeMovie,
    this.favoriteArtist,
    this.mbti,
    final List<String>? interests,
    this.memorablePlace,
    this.childhoodMemory,
    this.turningPoint,
    this.proudestMoment,
    this.bucketList,
    this.lifeLesson,
    this.showMovie = true,
    this.showArtist = true,
    this.showMbti = true,
  }) : _interests = interests;

  factory _$SignatureConnectionPreferencesImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$SignatureConnectionPreferencesImplFromJson(json);

  @override
  final String? lifeMovie;
  @override
  final String? favoriteArtist;
  @override
  final String? mbti;
  final List<String>? _interests;
  @override
  List<String>? get interests {
    final value = _interests;
    if (value == null) return null;
    if (_interests is EqualUnmodifiableListView) return _interests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? memorablePlace;
  @override
  final String? childhoodMemory;
  @override
  final String? turningPoint;
  @override
  final String? proudestMoment;
  @override
  final String? bucketList;
  @override
  final String? lifeLesson;
  @override
  @JsonKey()
  final bool showMovie;
  @override
  @JsonKey()
  final bool showArtist;
  @override
  @JsonKey()
  final bool showMbti;

  @override
  String toString() {
    return 'SignatureConnectionPreferences(lifeMovie: $lifeMovie, favoriteArtist: $favoriteArtist, mbti: $mbti, interests: $interests, memorablePlace: $memorablePlace, childhoodMemory: $childhoodMemory, turningPoint: $turningPoint, proudestMoment: $proudestMoment, bucketList: $bucketList, lifeLesson: $lifeLesson, showMovie: $showMovie, showArtist: $showArtist, showMbti: $showMbti)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignatureConnectionPreferencesImpl &&
            (identical(other.lifeMovie, lifeMovie) ||
                other.lifeMovie == lifeMovie) &&
            (identical(other.favoriteArtist, favoriteArtist) ||
                other.favoriteArtist == favoriteArtist) &&
            (identical(other.mbti, mbti) || other.mbti == mbti) &&
            const DeepCollectionEquality().equals(
              other._interests,
              _interests,
            ) &&
            (identical(other.memorablePlace, memorablePlace) ||
                other.memorablePlace == memorablePlace) &&
            (identical(other.childhoodMemory, childhoodMemory) ||
                other.childhoodMemory == childhoodMemory) &&
            (identical(other.turningPoint, turningPoint) ||
                other.turningPoint == turningPoint) &&
            (identical(other.proudestMoment, proudestMoment) ||
                other.proudestMoment == proudestMoment) &&
            (identical(other.bucketList, bucketList) ||
                other.bucketList == bucketList) &&
            (identical(other.lifeLesson, lifeLesson) ||
                other.lifeLesson == lifeLesson) &&
            (identical(other.showMovie, showMovie) ||
                other.showMovie == showMovie) &&
            (identical(other.showArtist, showArtist) ||
                other.showArtist == showArtist) &&
            (identical(other.showMbti, showMbti) ||
                other.showMbti == showMbti));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    lifeMovie,
    favoriteArtist,
    mbti,
    const DeepCollectionEquality().hash(_interests),
    memorablePlace,
    childhoodMemory,
    turningPoint,
    proudestMoment,
    bucketList,
    lifeLesson,
    showMovie,
    showArtist,
    showMbti,
  );

  /// Create a copy of SignatureConnectionPreferences
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignatureConnectionPreferencesImplCopyWith<
    _$SignatureConnectionPreferencesImpl
  >
  get copyWith =>
      __$$SignatureConnectionPreferencesImplCopyWithImpl<
        _$SignatureConnectionPreferencesImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SignatureConnectionPreferencesImplToJson(this);
  }
}

abstract class _SignatureConnectionPreferences
    implements SignatureConnectionPreferences {
  const factory _SignatureConnectionPreferences({
    final String? lifeMovie,
    final String? favoriteArtist,
    final String? mbti,
    final List<String>? interests,
    final String? memorablePlace,
    final String? childhoodMemory,
    final String? turningPoint,
    final String? proudestMoment,
    final String? bucketList,
    final String? lifeLesson,
    final bool showMovie,
    final bool showArtist,
    final bool showMbti,
  }) = _$SignatureConnectionPreferencesImpl;

  factory _SignatureConnectionPreferences.fromJson(Map<String, dynamic> json) =
      _$SignatureConnectionPreferencesImpl.fromJson;

  @override
  String? get lifeMovie;
  @override
  String? get favoriteArtist;
  @override
  String? get mbti;
  @override
  List<String>? get interests;
  @override
  String? get memorablePlace;
  @override
  String? get childhoodMemory;
  @override
  String? get turningPoint;
  @override
  String? get proudestMoment;
  @override
  String? get bucketList;
  @override
  String? get lifeLesson;
  @override
  bool get showMovie;
  @override
  bool get showArtist;
  @override
  bool get showMbti;

  /// Create a copy of SignatureConnectionPreferences
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignatureConnectionPreferencesImplCopyWith<
    _$SignatureConnectionPreferencesImpl
  >
  get copyWith => throw _privateConstructorUsedError;
}

ProfileSettings _$ProfileSettingsFromJson(Map<String, dynamic> json) {
  return _ProfileSettings.fromJson(json);
}

/// @nodoc
mixin _$ProfileSettings {
  bool get allowLocationSharing => throw _privateConstructorUsedError;
  bool get allowSparkNotifications => throw _privateConstructorUsedError;
  bool get allowMessageNotifications => throw _privateConstructorUsedError;
  bool get privateProfile => throw _privateConstructorUsedError;
  double get discoveryRadius => throw _privateConstructorUsedError;

  /// Serializes this ProfileSettings to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProfileSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProfileSettingsCopyWith<ProfileSettings> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProfileSettingsCopyWith<$Res> {
  factory $ProfileSettingsCopyWith(
    ProfileSettings value,
    $Res Function(ProfileSettings) then,
  ) = _$ProfileSettingsCopyWithImpl<$Res, ProfileSettings>;
  @useResult
  $Res call({
    bool allowLocationSharing,
    bool allowSparkNotifications,
    bool allowMessageNotifications,
    bool privateProfile,
    double discoveryRadius,
  });
}

/// @nodoc
class _$ProfileSettingsCopyWithImpl<$Res, $Val extends ProfileSettings>
    implements $ProfileSettingsCopyWith<$Res> {
  _$ProfileSettingsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProfileSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? allowLocationSharing = null,
    Object? allowSparkNotifications = null,
    Object? allowMessageNotifications = null,
    Object? privateProfile = null,
    Object? discoveryRadius = null,
  }) {
    return _then(
      _value.copyWith(
            allowLocationSharing: null == allowLocationSharing
                ? _value.allowLocationSharing
                : allowLocationSharing // ignore: cast_nullable_to_non_nullable
                      as bool,
            allowSparkNotifications: null == allowSparkNotifications
                ? _value.allowSparkNotifications
                : allowSparkNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            allowMessageNotifications: null == allowMessageNotifications
                ? _value.allowMessageNotifications
                : allowMessageNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            privateProfile: null == privateProfile
                ? _value.privateProfile
                : privateProfile // ignore: cast_nullable_to_non_nullable
                      as bool,
            discoveryRadius: null == discoveryRadius
                ? _value.discoveryRadius
                : discoveryRadius // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProfileSettingsImplCopyWith<$Res>
    implements $ProfileSettingsCopyWith<$Res> {
  factory _$$ProfileSettingsImplCopyWith(
    _$ProfileSettingsImpl value,
    $Res Function(_$ProfileSettingsImpl) then,
  ) = __$$ProfileSettingsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    bool allowLocationSharing,
    bool allowSparkNotifications,
    bool allowMessageNotifications,
    bool privateProfile,
    double discoveryRadius,
  });
}

/// @nodoc
class __$$ProfileSettingsImplCopyWithImpl<$Res>
    extends _$ProfileSettingsCopyWithImpl<$Res, _$ProfileSettingsImpl>
    implements _$$ProfileSettingsImplCopyWith<$Res> {
  __$$ProfileSettingsImplCopyWithImpl(
    _$ProfileSettingsImpl _value,
    $Res Function(_$ProfileSettingsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProfileSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? allowLocationSharing = null,
    Object? allowSparkNotifications = null,
    Object? allowMessageNotifications = null,
    Object? privateProfile = null,
    Object? discoveryRadius = null,
  }) {
    return _then(
      _$ProfileSettingsImpl(
        allowLocationSharing: null == allowLocationSharing
            ? _value.allowLocationSharing
            : allowLocationSharing // ignore: cast_nullable_to_non_nullable
                  as bool,
        allowSparkNotifications: null == allowSparkNotifications
            ? _value.allowSparkNotifications
            : allowSparkNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        allowMessageNotifications: null == allowMessageNotifications
            ? _value.allowMessageNotifications
            : allowMessageNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        privateProfile: null == privateProfile
            ? _value.privateProfile
            : privateProfile // ignore: cast_nullable_to_non_nullable
                  as bool,
        discoveryRadius: null == discoveryRadius
            ? _value.discoveryRadius
            : discoveryRadius // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProfileSettingsImpl implements _ProfileSettings {
  const _$ProfileSettingsImpl({
    this.allowLocationSharing = true,
    this.allowSparkNotifications = true,
    this.allowMessageNotifications = true,
    this.privateProfile = false,
    this.discoveryRadius = 1000,
  });

  factory _$ProfileSettingsImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProfileSettingsImplFromJson(json);

  @override
  @JsonKey()
  final bool allowLocationSharing;
  @override
  @JsonKey()
  final bool allowSparkNotifications;
  @override
  @JsonKey()
  final bool allowMessageNotifications;
  @override
  @JsonKey()
  final bool privateProfile;
  @override
  @JsonKey()
  final double discoveryRadius;

  @override
  String toString() {
    return 'ProfileSettings(allowLocationSharing: $allowLocationSharing, allowSparkNotifications: $allowSparkNotifications, allowMessageNotifications: $allowMessageNotifications, privateProfile: $privateProfile, discoveryRadius: $discoveryRadius)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProfileSettingsImpl &&
            (identical(other.allowLocationSharing, allowLocationSharing) ||
                other.allowLocationSharing == allowLocationSharing) &&
            (identical(
                  other.allowSparkNotifications,
                  allowSparkNotifications,
                ) ||
                other.allowSparkNotifications == allowSparkNotifications) &&
            (identical(
                  other.allowMessageNotifications,
                  allowMessageNotifications,
                ) ||
                other.allowMessageNotifications == allowMessageNotifications) &&
            (identical(other.privateProfile, privateProfile) ||
                other.privateProfile == privateProfile) &&
            (identical(other.discoveryRadius, discoveryRadius) ||
                other.discoveryRadius == discoveryRadius));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    allowLocationSharing,
    allowSparkNotifications,
    allowMessageNotifications,
    privateProfile,
    discoveryRadius,
  );

  /// Create a copy of ProfileSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProfileSettingsImplCopyWith<_$ProfileSettingsImpl> get copyWith =>
      __$$ProfileSettingsImplCopyWithImpl<_$ProfileSettingsImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ProfileSettingsImplToJson(this);
  }
}

abstract class _ProfileSettings implements ProfileSettings {
  const factory _ProfileSettings({
    final bool allowLocationSharing,
    final bool allowSparkNotifications,
    final bool allowMessageNotifications,
    final bool privateProfile,
    final double discoveryRadius,
  }) = _$ProfileSettingsImpl;

  factory _ProfileSettings.fromJson(Map<String, dynamic> json) =
      _$ProfileSettingsImpl.fromJson;

  @override
  bool get allowLocationSharing;
  @override
  bool get allowSparkNotifications;
  @override
  bool get allowMessageNotifications;
  @override
  bool get privateProfile;
  @override
  double get discoveryRadius;

  /// Create a copy of ProfileSettings
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProfileSettingsImplCopyWith<_$ProfileSettingsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProfileStats _$ProfileStatsFromJson(Map<String, dynamic> json) {
  return _ProfileStats.fromJson(json);
}

/// @nodoc
mixin _$ProfileStats {
  int get totalSparks => throw _privateConstructorUsedError;
  int get totalMatches => throw _privateConstructorUsedError;
  int get totalSignalSpots => throw _privateConstructorUsedError;
  int get profileViews => throw _privateConstructorUsedError;
  DateTime? get lastActive => throw _privateConstructorUsedError;

  /// Serializes this ProfileStats to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProfileStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProfileStatsCopyWith<ProfileStats> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProfileStatsCopyWith<$Res> {
  factory $ProfileStatsCopyWith(
    ProfileStats value,
    $Res Function(ProfileStats) then,
  ) = _$ProfileStatsCopyWithImpl<$Res, ProfileStats>;
  @useResult
  $Res call({
    int totalSparks,
    int totalMatches,
    int totalSignalSpots,
    int profileViews,
    DateTime? lastActive,
  });
}

/// @nodoc
class _$ProfileStatsCopyWithImpl<$Res, $Val extends ProfileStats>
    implements $ProfileStatsCopyWith<$Res> {
  _$ProfileStatsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProfileStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalSparks = null,
    Object? totalMatches = null,
    Object? totalSignalSpots = null,
    Object? profileViews = null,
    Object? lastActive = freezed,
  }) {
    return _then(
      _value.copyWith(
            totalSparks: null == totalSparks
                ? _value.totalSparks
                : totalSparks // ignore: cast_nullable_to_non_nullable
                      as int,
            totalMatches: null == totalMatches
                ? _value.totalMatches
                : totalMatches // ignore: cast_nullable_to_non_nullable
                      as int,
            totalSignalSpots: null == totalSignalSpots
                ? _value.totalSignalSpots
                : totalSignalSpots // ignore: cast_nullable_to_non_nullable
                      as int,
            profileViews: null == profileViews
                ? _value.profileViews
                : profileViews // ignore: cast_nullable_to_non_nullable
                      as int,
            lastActive: freezed == lastActive
                ? _value.lastActive
                : lastActive // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProfileStatsImplCopyWith<$Res>
    implements $ProfileStatsCopyWith<$Res> {
  factory _$$ProfileStatsImplCopyWith(
    _$ProfileStatsImpl value,
    $Res Function(_$ProfileStatsImpl) then,
  ) = __$$ProfileStatsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int totalSparks,
    int totalMatches,
    int totalSignalSpots,
    int profileViews,
    DateTime? lastActive,
  });
}

/// @nodoc
class __$$ProfileStatsImplCopyWithImpl<$Res>
    extends _$ProfileStatsCopyWithImpl<$Res, _$ProfileStatsImpl>
    implements _$$ProfileStatsImplCopyWith<$Res> {
  __$$ProfileStatsImplCopyWithImpl(
    _$ProfileStatsImpl _value,
    $Res Function(_$ProfileStatsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProfileStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalSparks = null,
    Object? totalMatches = null,
    Object? totalSignalSpots = null,
    Object? profileViews = null,
    Object? lastActive = freezed,
  }) {
    return _then(
      _$ProfileStatsImpl(
        totalSparks: null == totalSparks
            ? _value.totalSparks
            : totalSparks // ignore: cast_nullable_to_non_nullable
                  as int,
        totalMatches: null == totalMatches
            ? _value.totalMatches
            : totalMatches // ignore: cast_nullable_to_non_nullable
                  as int,
        totalSignalSpots: null == totalSignalSpots
            ? _value.totalSignalSpots
            : totalSignalSpots // ignore: cast_nullable_to_non_nullable
                  as int,
        profileViews: null == profileViews
            ? _value.profileViews
            : profileViews // ignore: cast_nullable_to_non_nullable
                  as int,
        lastActive: freezed == lastActive
            ? _value.lastActive
            : lastActive // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProfileStatsImpl implements _ProfileStats {
  const _$ProfileStatsImpl({
    this.totalSparks = 0,
    this.totalMatches = 0,
    this.totalSignalSpots = 0,
    this.profileViews = 0,
    this.lastActive,
  });

  factory _$ProfileStatsImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProfileStatsImplFromJson(json);

  @override
  @JsonKey()
  final int totalSparks;
  @override
  @JsonKey()
  final int totalMatches;
  @override
  @JsonKey()
  final int totalSignalSpots;
  @override
  @JsonKey()
  final int profileViews;
  @override
  final DateTime? lastActive;

  @override
  String toString() {
    return 'ProfileStats(totalSparks: $totalSparks, totalMatches: $totalMatches, totalSignalSpots: $totalSignalSpots, profileViews: $profileViews, lastActive: $lastActive)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProfileStatsImpl &&
            (identical(other.totalSparks, totalSparks) ||
                other.totalSparks == totalSparks) &&
            (identical(other.totalMatches, totalMatches) ||
                other.totalMatches == totalMatches) &&
            (identical(other.totalSignalSpots, totalSignalSpots) ||
                other.totalSignalSpots == totalSignalSpots) &&
            (identical(other.profileViews, profileViews) ||
                other.profileViews == profileViews) &&
            (identical(other.lastActive, lastActive) ||
                other.lastActive == lastActive));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    totalSparks,
    totalMatches,
    totalSignalSpots,
    profileViews,
    lastActive,
  );

  /// Create a copy of ProfileStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProfileStatsImplCopyWith<_$ProfileStatsImpl> get copyWith =>
      __$$ProfileStatsImplCopyWithImpl<_$ProfileStatsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProfileStatsImplToJson(this);
  }
}

abstract class _ProfileStats implements ProfileStats {
  const factory _ProfileStats({
    final int totalSparks,
    final int totalMatches,
    final int totalSignalSpots,
    final int profileViews,
    final DateTime? lastActive,
  }) = _$ProfileStatsImpl;

  factory _ProfileStats.fromJson(Map<String, dynamic> json) =
      _$ProfileStatsImpl.fromJson;

  @override
  int get totalSparks;
  @override
  int get totalMatches;
  @override
  int get totalSignalSpots;
  @override
  int get profileViews;
  @override
  DateTime? get lastActive;

  /// Create a copy of ProfileStats
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProfileStatsImplCopyWith<_$ProfileStatsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UpdateProfileRequest _$UpdateProfileRequestFromJson(Map<String, dynamic> json) {
  return _UpdateProfileRequest.fromJson(json);
}

/// @nodoc
mixin _$UpdateProfileRequest {
  String? get displayName => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  String? get location => throw _privateConstructorUsedError;
  List<String>? get interests => throw _privateConstructorUsedError;
  ProfileVisibility? get visibility => throw _privateConstructorUsedError;

  /// Serializes this UpdateProfileRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UpdateProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UpdateProfileRequestCopyWith<UpdateProfileRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UpdateProfileRequestCopyWith<$Res> {
  factory $UpdateProfileRequestCopyWith(
    UpdateProfileRequest value,
    $Res Function(UpdateProfileRequest) then,
  ) = _$UpdateProfileRequestCopyWithImpl<$Res, UpdateProfileRequest>;
  @useResult
  $Res call({
    String? displayName,
    String? bio,
    String? location,
    List<String>? interests,
    ProfileVisibility? visibility,
  });
}

/// @nodoc
class _$UpdateProfileRequestCopyWithImpl<
  $Res,
  $Val extends UpdateProfileRequest
>
    implements $UpdateProfileRequestCopyWith<$Res> {
  _$UpdateProfileRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UpdateProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? bio = freezed,
    Object? location = freezed,
    Object? interests = freezed,
    Object? visibility = freezed,
  }) {
    return _then(
      _value.copyWith(
            displayName: freezed == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            location: freezed == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String?,
            interests: freezed == interests
                ? _value.interests
                : interests // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            visibility: freezed == visibility
                ? _value.visibility
                : visibility // ignore: cast_nullable_to_non_nullable
                      as ProfileVisibility?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UpdateProfileRequestImplCopyWith<$Res>
    implements $UpdateProfileRequestCopyWith<$Res> {
  factory _$$UpdateProfileRequestImplCopyWith(
    _$UpdateProfileRequestImpl value,
    $Res Function(_$UpdateProfileRequestImpl) then,
  ) = __$$UpdateProfileRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? displayName,
    String? bio,
    String? location,
    List<String>? interests,
    ProfileVisibility? visibility,
  });
}

/// @nodoc
class __$$UpdateProfileRequestImplCopyWithImpl<$Res>
    extends _$UpdateProfileRequestCopyWithImpl<$Res, _$UpdateProfileRequestImpl>
    implements _$$UpdateProfileRequestImplCopyWith<$Res> {
  __$$UpdateProfileRequestImplCopyWithImpl(
    _$UpdateProfileRequestImpl _value,
    $Res Function(_$UpdateProfileRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UpdateProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? bio = freezed,
    Object? location = freezed,
    Object? interests = freezed,
    Object? visibility = freezed,
  }) {
    return _then(
      _$UpdateProfileRequestImpl(
        displayName: freezed == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        location: freezed == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String?,
        interests: freezed == interests
            ? _value._interests
            : interests // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        visibility: freezed == visibility
            ? _value.visibility
            : visibility // ignore: cast_nullable_to_non_nullable
                  as ProfileVisibility?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UpdateProfileRequestImpl implements _UpdateProfileRequest {
  const _$UpdateProfileRequestImpl({
    this.displayName,
    this.bio,
    this.location,
    final List<String>? interests,
    this.visibility,
  }) : _interests = interests;

  factory _$UpdateProfileRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$UpdateProfileRequestImplFromJson(json);

  @override
  final String? displayName;
  @override
  final String? bio;
  @override
  final String? location;
  final List<String>? _interests;
  @override
  List<String>? get interests {
    final value = _interests;
    if (value == null) return null;
    if (_interests is EqualUnmodifiableListView) return _interests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final ProfileVisibility? visibility;

  @override
  String toString() {
    return 'UpdateProfileRequest(displayName: $displayName, bio: $bio, location: $location, interests: $interests, visibility: $visibility)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateProfileRequestImpl &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(
              other._interests,
              _interests,
            ) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    displayName,
    bio,
    location,
    const DeepCollectionEquality().hash(_interests),
    visibility,
  );

  /// Create a copy of UpdateProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateProfileRequestImplCopyWith<_$UpdateProfileRequestImpl>
  get copyWith =>
      __$$UpdateProfileRequestImplCopyWithImpl<_$UpdateProfileRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UpdateProfileRequestImplToJson(this);
  }
}

abstract class _UpdateProfileRequest implements UpdateProfileRequest {
  const factory _UpdateProfileRequest({
    final String? displayName,
    final String? bio,
    final String? location,
    final List<String>? interests,
    final ProfileVisibility? visibility,
  }) = _$UpdateProfileRequestImpl;

  factory _UpdateProfileRequest.fromJson(Map<String, dynamic> json) =
      _$UpdateProfileRequestImpl.fromJson;

  @override
  String? get displayName;
  @override
  String? get bio;
  @override
  String? get location;
  @override
  List<String>? get interests;
  @override
  ProfileVisibility? get visibility;

  /// Create a copy of UpdateProfileRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateProfileRequestImplCopyWith<_$UpdateProfileRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

ProfileResponse _$ProfileResponseFromJson(Map<String, dynamic> json) {
  return _ProfileResponse.fromJson(json);
}

/// @nodoc
mixin _$ProfileResponse {
  bool get success => throw _privateConstructorUsedError;
  UserProfile get data => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;

  /// Serializes this ProfileResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProfileResponseCopyWith<ProfileResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProfileResponseCopyWith<$Res> {
  factory $ProfileResponseCopyWith(
    ProfileResponse value,
    $Res Function(ProfileResponse) then,
  ) = _$ProfileResponseCopyWithImpl<$Res, ProfileResponse>;
  @useResult
  $Res call({bool success, UserProfile data, String? message});

  $UserProfileCopyWith<$Res> get data;
}

/// @nodoc
class _$ProfileResponseCopyWithImpl<$Res, $Val extends ProfileResponse>
    implements $ProfileResponseCopyWith<$Res> {
  _$ProfileResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _value.copyWith(
            success: null == success
                ? _value.success
                : success // ignore: cast_nullable_to_non_nullable
                      as bool,
            data: null == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as UserProfile,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserProfileCopyWith<$Res> get data {
    return $UserProfileCopyWith<$Res>(_value.data, (value) {
      return _then(_value.copyWith(data: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ProfileResponseImplCopyWith<$Res>
    implements $ProfileResponseCopyWith<$Res> {
  factory _$$ProfileResponseImplCopyWith(
    _$ProfileResponseImpl value,
    $Res Function(_$ProfileResponseImpl) then,
  ) = __$$ProfileResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool success, UserProfile data, String? message});

  @override
  $UserProfileCopyWith<$Res> get data;
}

/// @nodoc
class __$$ProfileResponseImplCopyWithImpl<$Res>
    extends _$ProfileResponseCopyWithImpl<$Res, _$ProfileResponseImpl>
    implements _$$ProfileResponseImplCopyWith<$Res> {
  __$$ProfileResponseImplCopyWithImpl(
    _$ProfileResponseImpl _value,
    $Res Function(_$ProfileResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _$ProfileResponseImpl(
        success: null == success
            ? _value.success
            : success // ignore: cast_nullable_to_non_nullable
                  as bool,
        data: null == data
            ? _value.data
            : data // ignore: cast_nullable_to_non_nullable
                  as UserProfile,
        message: freezed == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProfileResponseImpl implements _ProfileResponse {
  const _$ProfileResponseImpl({
    required this.success,
    required this.data,
    this.message,
  });

  factory _$ProfileResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProfileResponseImplFromJson(json);

  @override
  final bool success;
  @override
  final UserProfile data;
  @override
  final String? message;

  @override
  String toString() {
    return 'ProfileResponse(success: $success, data: $data, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProfileResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.data, data) || other.data == data) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, success, data, message);

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProfileResponseImplCopyWith<_$ProfileResponseImpl> get copyWith =>
      __$$ProfileResponseImplCopyWithImpl<_$ProfileResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ProfileResponseImplToJson(this);
  }
}

abstract class _ProfileResponse implements ProfileResponse {
  const factory _ProfileResponse({
    required final bool success,
    required final UserProfile data,
    final String? message,
  }) = _$ProfileResponseImpl;

  factory _ProfileResponse.fromJson(Map<String, dynamic> json) =
      _$ProfileResponseImpl.fromJson;

  @override
  bool get success;
  @override
  UserProfile get data;
  @override
  String? get message;

  /// Create a copy of ProfileResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProfileResponseImplCopyWith<_$ProfileResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
