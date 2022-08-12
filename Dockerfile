FROM node:16

# 앱 디렉터리 생성
WORKDIR /src/app

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package*.json .

RUN npm install

# TS를 이용한 node이기 때문에 전역으로 설치
RUN npm install -g typescript

# 현재 폴더에 있는 모든 파일들을 복사하여 이미지 디렉토리에 복사
COPY ./ /src/app/

# build하여 JS파일로 컴파일
RUN npm run build

# 앱이 3333포트에 바인딩되어 있으므로 EXPOSE 지시어를 사용하여 도커 데몬에 매핑
EXPOSE 3333

# 런타임을 정의하는 CMD로 앱을 실행하는 명령어 정의
CMD ["npm", "run", "start"]
# CMD [ "node", "index.js" ]