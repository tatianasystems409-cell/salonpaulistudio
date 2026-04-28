# Seguridad de Paulis Studio - Especificación Rígida

## 1. Invariantes de Datos
- Solo `tatianasystems409@gmail.com` puede crear, editar o eliminar SERVICIOS.
- Los clientes solo pueden crear CITAS, pero no modificarlas una vez creadas (prevención de sabotaje).
- La información de PII (Email, Teléfono) está restringida al Admin.

## 2. Los 12 Payloads de Ataque (Pilar 0)
1. **Ataque de Precio:** Modificar el precio de un servicio desde la consola -> `RECHAZADO`.
2. **Suplantación de Identidad:** Intentar crear un servicio con otro correo -> `RECHAZADO`.
3. **Inyección de ID:** Usar un ID de 1MB para saturar la base de datos -> `RECHAZADO`.
4. **Modificación de Cita Ajena:** Un cliente intentando borrar la cita de otro -> `RECHAZADO`.
5. **Escalada de Privilegios:** Intentar marcarse como `isAdmin` en la base de datos -> `RECHAZADO`.
6. **Ghost Field:** Agregar campo `hack: true` a una cita -> `RECHAZADO` (Strict Schema).
7. **Timestamp Spoofing:** Enviar una fecha de creación del pasado -> `RECHAZADO`.
8. **Negative Stock:** Poner inventario en -100 -> `RECHAZADO`.
9. **Email Unverified:** Intentar loguearse con un correo clonado no verificado -> `RECHAZADO`.
10. **Query Scraping:** Intentar listar todos los correos de clientes desde un script -> `RECHAZADO`.
11. **State Shortcut:** Cambiar estado de cita de 'pendiente' a 'completada' sin ser admin -> `RECHAZADO`.
12. **Denial of Wallet:** Enviar 10,000 peticiones de servicios en 1 segundo -> `RECHAZADO` (por cuotas y validación estática).

## 3. Matriz de Acceso
| Colección | Lectura | Creación | Actualización | Borrado |
|-----------|---------|----------|---------------|---------|
| Services  | Público | SuperAdmin | SuperAdmin | SuperAdmin |
| Appts     | Admin   | Público   | Admin         | Admin   |
| Inventory | Admin   | Admin     | Admin         | Admin   |
