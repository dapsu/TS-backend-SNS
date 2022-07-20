<div align="center">

# Express, TypeScript로 구현한 SNS 백엔드 서비스

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=Express&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=TypeScript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=Sequelize&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=MySQL&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=Redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=flat&logo=Amazon EC2S&logoColor=white"/>
</p>

</div> 
<br/>

## Project
#### 서비스 개요
- 사용자는 본 서비스에 접속하여 게시물을 업로드하거나 다른 사람의 게시물을 확인하고, 좋아요를 누를 수 있습니다.

#### 개발 기간
- 2022/07/20 ~ 2022/07/22

<br/>

## 요구사항

#### 1. 유저 관리
- 유저 회원가입: 이메일을 ID로 사용
- 유저 로그인 및 인증: JWT토큰을 발급받으며, 이를 추후 사용자 인증으로 사용
  - 로그아웃은 프론트엔드에서 처리
    
#### 2. 게시글
- 게시글 생성: 제목, 해시태그 등을 입력하여 생성
  - 제목, 내용, 해시태그는 필수 입력사항이며, 작성자 정보는 request body에 존재하지 않고, 해당 API를 요청한 인증정보에서 추출하여 등록
  - 해시태그는 #로 시작되고 ,로 구분되는 텍스트가 입력
- 게시글 수정: 작성자만 수정 가능
- 게시글 삭제: 작성자만 삭제 가능
  - 삭제된 게시글은 작성자에 의해 다시 복구 가능
- 게시글 상세보기: 모든 사용자는 모든 게시물에 보기권한 있음
  - 작성자를 포함한 사용자는 본 게시글에 좋아요 누르기 가능(다시 좋아요 누를 시, 좋아요 취소)
  - 작성자 포함한 사용자가 게시글 상세보기 하면 조회수 1 증가(횟수제한 없음)
- 게시글 목록: 모든 사용자는 모든 게시물에 보기권한 있음
  - 게시글 목록에는 제목, 작성자, 해시태그, 작성일, 좋아요 수, 조회수 포함

#### 게시글 목록 조회 시 , 아래 4가지 동작 구현(동시에 적용 가능)
- Ordering (=sorting, 정렬)
  - 사용자는 게시글 목록을 원하는 값으로 정렬 가능
    - default: 작성일
    - 작성일, 좋아요 수, 조회수 중 1개만 선택 가능
  - 오름차순, 내림차순 선택 가능
- Searching (=검색)
  - 사용자는 입력한 키워드로 해당 키워드를 포함한 게시물 조회 가능
- Filtering (= 필터링)
  - 사용자는 지정한 키워드로 해당 해시태그를 포함한 게시물 필터링 가능
- Pagination (= 페이지 기능)
  - 사용자는 1페이지 당 게시글 수 조정 가능
    - default: 10건

<br/>

## DB 모델링
- ERD

![image](https://user-images.githubusercontent.com/80298502/179881342-5c9a32b3-3ab1-45ca-a619-c4446f25b1d6.png)

<br/>

## API 설계

### 유저 회원가입
* URL: base-url/user/join
* METHOD: POST
* Request
```
{
  userId: "goodday@gamil.com",
  password: "123qweasd!",
  name: "찰리푸스"
}
```
* Response
	* status: 201
```
{
  messege: "회원가입이 완료되었습니다."
}
```

### 유저 로그인
* URL: base-url/user/login
* METHOD: POST
* Request
```
{
  userId: "goodday@gamil.com",
  password: "123qweasd!"
}
```
* Response
	* status: 200
```
{
  messege: "로그인되었습니다."
}
```

### 게시 생성
* URL: base-url/post
* METHOD: POST
* Request
```
{
  content: "꿀꿀꿀꿀",
  hashtags: "#맛집,#서울,#브런치 카페,#주말"
}
```
* Response
	* status: 200
```
{
  messege: "포스팅되었습니다."
}
```

### 게시글 수정
* URL: base-url/post/:postId
* METHOD: PATCH
* Request
```
{
  content: "낄낄낄낄",
  hashtags: "#맛집,#서울,#브런치 카페,#주말"
}
```
* Response
	* status: 200
```
{
  messege: "해당 게시글을 수정했습니다."
}
```

### 게시글 삭제
* URL: base-url/post/:postId
* METHOD: PATCH
* Request
```
{
  state: false
}
```
* Response
	* status: 200
```
{
  messege: "해당 게시글을 삭제했습니다."
}
```

### 삭제 게시글 복구
* URL: base-url/post/:postId
* METHOD: PATCH
* Request
```
{
  state: true
}
```
* Response
	* status: 200
```
{
  messege: "해당 게시글을 복구했습니다."
}
```

### 특정 게시글 조회
* URL: base-url/post/:postId
* METHOD: GET
* Request
```

```
* Response
	* status: 200
```
{
  content: "낄낄낄낄",
  hashtags: "#맛집,#서울,#브런치 카페,#주말"
}
```

### 게시글 목록 조회
* URL: base-url/post/list
* METHOD: GET
* Request
```

```
* Response
	* status: 200
```
[
  {
    content: "낄낄낄낄",
    hashtags: "#맛집,#서울,#브런치 카페,#주말"
  },
  {
    content: "광교호수공원 좋다!",
    hashtags: "#광교,#호수공원"
  },
  ...
]
```

<br/>

## 필수 기능 구현

### 유저 인증 기능 JWT 방식 구현
> 추후 추가 예정

### 게시글 관련 로직 구현
> 추후 추가 예정

<br/>

## 부가 기능 구현

### 게시글 목록 4가지 기능 동작
> 추후 추가 예정

<br/>

## 추가 구현

### redis 활용

### docker 작업


