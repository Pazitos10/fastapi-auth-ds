class ErrorCode:
    ROLE_NOT_FOUND = "Rol no encontrado"
    USER_NOT_FOUND = "Usuario no encontrado"
    USERNAME_TAKEN = "Otro usuario ya tiene este username"
    # TODO: cambiar el siguiente mensaje de acuerdo a los criterios de validación de un password
    USER_INVALID_PASSWORD = (
        "La contraseña es muy corta, debe contar con al menos 8 caracteres"
    )
    USER_CANNOT_DELETE_ITSELF = "El usuario no puede eliminarse a sí mismo"
