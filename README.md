## fastapi-auth-ds

Este proyecto está pensado para ser integrado a otros que utilicen como base `fastapi-base-ds`. Hace mención a conceptos y utiliza porciones de código del proyecto [`RA-grupo-5`](https://github.com/UNPSJB/RA-grupo-5/tree/main) para la gestión de reportes académicos (Desarrollo de software - 2025). 

### Backend

En el directorio backend, encontraremos dos módulos:
- `auth`: permite realizar las operaciones de autenticación/autorización como: registro de usuarios, cambio de contraseña, login y logout. También gestiona la creación/actualización de tokens de autenticación por medio de cookies.
- `users`: permite realizar las operaciones básicas CRUD para el modelo de usuarios, creación de roles y asignación de los mismos. Por defecto, los usuarios tendrán un rol de "user" que carece de permisos para realizar la mayoría de las operaciones.

En la raíz del proyecto encontraremos dos archivos que no estan presentes en `fastapi-base-ds`:
- `settings.py`: se encarga de leer las variables de entorno para configurar el proyecto y poner a disposición los valores de las mismas a través de constantes y funciones (por ejemplo para la creación de cookies). Centraliza la lectura de variables de entorno.
- Script de carga para datos de prueba `load_data.py`: Crea instancias de roles y por cada rol, un usuario.
 
### Frontend

Por otra parte, el directorio frontend tiene la siguiente estructura:
- `components`
  - `ProtectedRoute` : permite el acceso a una rutas solo si el usuario logueado tiene un determinado rol. La estructura general de rutas está definida en `frontend/src/main.tsx`
- `constants`: Las diferentes rutas de la API REST consultada pueden configurarse en el archivo `frontend/src/constants/api.ts`. Inicialmente encontrarán algunos de los endpoints pertenecientes a los módulos `auth` y `users` de la porción backend de este proyecto y que son utilizados para demostrar la funcionalidad básica. Estas rutas pueden accederse desde otros componentes importando las constantes que las representan.
- `features`: 
  - `auth`: con los componentes `Login`, `Registrar`, `ResetPassword` y `NoAutorizado`.
  - `menu`: `MenuPrincipal` dispone de algunos botones para probar las funcionalidades y demostrar el renderizado condicional de acuerdo al rol del usuario logueado.
  - `user`: `Encuesta`, `InformesAC` (Actividad Curricular), `InformesSinteticos` y `PerfilUsuario`. Nuevamente, estos elementos debieran estar disponibles de acuerdo al rol del usuario logueado.
- `hooks`: habiendo iniciado sesión, la información del usuario está disponible por medio del hook `useAuth()`. Este hook tambien pone a disposición variables de estado como `IsAuthenticated`, `IsLoading`, `error` y algunas operaciones como: `login()`, `register()` (para creación de nuevas cuentas), `logout()` y `resetPassword()` (para el cambio de contraseñas). Ver: `frontend/src/context/AuthContext.tsx`.
- `layouts`: un layout básico que comprueba que para renderizar el contenido de la app, el usuario haya iniciado sesión o de lo contrario será redirigido a la página para hacerlo. Ver: `frontend/src/layouts/AuthLayout.tsx`.
- `types`: La estructura de datos para los diferentes tipos utilizados en el proyecto están definidos en `frontend/src/types`.

### ¿Cómo se ejecuta? 

Al tratarse de dos aplicaciones (backend y frontend), debemos instalar las dependencias de las mismas por separado. 
Para las dependencias del proyecto FastAPI, seguir las instrucciones del repositorio [`fastapi-base-ds`](https://github.com/Pazitos10/fastapi-base-ds) ya que siguen siendo válidas. 

Para la porción frontend del proyecto, necesitamos tener instalados [`node`](https://nodejs.org/) y `npm`. Luego, debemos ubicarnos en el directorio `frontend` y ejecutar: `npm install` mediante la línea de comandos.

Cada aplicación será ejecutada en un una ventana de línea de comandos distinta. Estos son los comandos:

- Backend: `fastapi dev src/main.py --reload` 
- Frontend: `npm run dev`

**NOTA:** Se sobreentiende que para ejecutar dichos comandos se debe estar en el directorio correcto, las dependencias instaladas y entornos virtuales activados (si corresponde).

### ¿Cómo lo integro a mi proyecto?

#### Backend
Para empezar, será necesario copiar los módulos `auth` y `users` al directorio correspondiente al backend en el proyecto al cual quiero intregrarlo.
Serán necesarias las siguientes modificaciones:
- Añadir routers de los nuevos módulos al archivo `main.py`.
- Utilizar módulo `settings.py`: esto requiere modificar aquellos archivos donde leíamos variables de entorno utilizando `load_dotenv()` y `os.getenv()` para que en su lugar importe las constantes de dichas variables al estilo:

```python 
from settings import DB_URL
```
Siendo en `settings.py` donde hacemos la lectura de todas las variables de entorno a utilizar. Analizar las posibles adaptaciones necesarias de acuerdo a las variables del archivo `.env` del proyecto donde queremos integrarlo.

- Implementar y utilizar funciones de control como dependencia (ver: `src/auth/dependencies.py`) en los routers. 
Por ejemplo, supongamos que tenemos la siguiente ruta no protegida en nuestra API:

```python
# ...
@router.post("/",response_model=schemas.InformeAsignaturaRead)
def create_informe_asignatura(informe: schemas.InformeAsignaturaCreate,  db: Session = Depends(get_db)):
    return services.crear_informe_asignatura(db,informe)

#...    
```
Si nosotros quisieramos que a esta ruta solo pudieran acceder usuarios con rol de "docente", la modificaríamos de la siguiente manera:

```python
# ...
@router.post("/",response_model=schemas.InformeAsignaturaRead)
def create_informe_asignatura(
    informe: schemas.InformeAsignaturaCreate,  
    db: Session = Depends(get_db),
    user: user_schemas.User = Depends(tiene_rol_docente)):
    return services.crear_informe_asignatura(db,informe)
#...    
```
Si bien para realizar la operación, el objeto `user` no va a ser necesario, la función `tiene_rol_docente()` nos permitiría hacer un control como el que sigue:

```python
async def tiene_rol_docente(
    db: Session = Depends(get_db),
    user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    user = await has_role("docente", db, user)
    if user:
        return user
    raise PermissionDenied()
```

Si la condición de que el usuario tenga rol "docente" no se cumple, la api lanza una excepción de tipo `PermissionDenied` y detiene el procesamiento del request. Desde el frontend, recibiremos este error y podremos mostrar el mensaje adecuado para la ocasión.

Podemos utilizar y extender el funcionamiento de `has_role()` según lo creamos conveniente, siempre y cuando dejemos funciones como `tiene_rol_docente()` y similares en el archivo `src/auth/dependencies.py` para mantener la organización del proyecto.

#### ¿Cómo funciona esto?
Si seguimos la cadena de dependencias de las funciones, nos toparemos con que `tiene_rol_docente` "depende de" `get_current_user` para poder acceder al objeto `user`.
Por su parte `get_current_user`, abrirá el access token (JWT) e intentará recuperar información del usuario para buscarlo en la DB. Si el usuario no existiera o el token fuera inválido, lanzará una excepción que rechazará el request y detendrá el procesamiento del mismo.

```python
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_cookie),
):
    """Obtiene el objeto User (DB) que está asociado al token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_str = payload.get("sub")
        if user_str is None:
            raise exceptions.InvalidCredentials()
        user = users_schemas.User.model_validate_json(user_str)
        token_data = TokenData(username=user.username)
    except InvalidTokenError:
        raise exceptions.NotAuthenticated()
    user = users_service.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise exceptions.InvalidCredentials()
    return user
```
Si el usuario es encontrado, es devuelto por parámetros a `tiene_rol_docente` y el procesamiento sigue en esa función.

#### Frontend

Las modificaciones a realizar a nuestro proyecto original dependerán en gran parte de como este esté organizado por lo que es posible que ubiquemos componentes, layouts, menu, etc. en una estructura diferente a la que se presenta en este repositorio.
Lo más relevante es la correcta utilización de componentes como `ProtectedRoute`, `AuthLayout`,  `AuthProvider` (ver `main.tsx`) y el hook `useAuth()` para poder tomar provecho de la información del usuario logueado en cualquier componente en el que nos encontremos.

Por ejemplo, si tuvieramos un componente como el que sigue:

```tsx
export default function EncuestasPendientes() {
  const { encuestas, loading, error } = useEncuestas();

  //...
  const Pendientes = encuestas.filter(
    (encuesta) => encuesta.estado === "abierta"
  );

  //...
```

Podríamos modificarlo para que el hook `useEncuestas()` recupere únicamente las encuestas del usuario logueado. Para eso podríamos pasarle por parámetro el id del usuario actual:

```tsx
export default function EncuestasPendientes() {
  const { currentUser } = useAuth();
  const { encuestas, loading, error } = useEncuestas(currentUser.id);

  //...
```
Por supuesto, esto requeriría modificar el hook `useEncuestas` para:

- Recibir el id por parámetro
- Modificar la URL que este consulta para incluir este nuevo parámetro. Utilizar constantes definidas en `constants/api.ts`
- Incluir el access token en el request con `credentials: 'include'` si usamos [fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch#enviar_una_petici%C3%B3n_con_credenciales_incluido) o `withCredentials: true` si usamos [axios](https://axios-http.com/es/docs/req_config).

El hook `useAuth` tiene a disposición variables de estado/setters como `error`/`setError` y `isLoading`/`setIsLoading` que podemos reutilizar para mostrar mensajes de error o de contenido especial para cuando la API está demorando en contestar algún request.

Por otra parte, en la ruta consultada por `useEncuestas` debería hacerse el control del rol del usuario para que solo pueda acceder a las encuestas si tiene el rol "alumno", al mismo tiempo que filtrarlas para devolver solo aquellas que le pertenecen al usuario en cuestión.

Finalmente, los componentes que devuelve JSX o TSX deben ser adaptados para que utilicen los mismos componentes con estilo que utilice nuestro proyecto ya que en este repositorio solo cuentan con HTML/CSS básico para los fines demostrativos. 

### TODO:
- [ ] Por cuestiones de tiempo, la implementación de la funcionalidad para la recuperación de contraseñas por medio de e-mail no está terminada aunque hay componentes como `RecuperarPassword` y `NuevaPassword` y endpoints en `backend/src/auth/router.py` pensados para este fin.
