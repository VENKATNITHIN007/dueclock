// used for backend validation send by zod
import { ZodError } from "zod";

export function zodToFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.length ? issue.path.join(".") : "_";
    if (!fieldErrors[field]) fieldErrors[field] = [];
    fieldErrors[field].push(issue.message);
  }

  return {
    message: "Validation failed",
    errors: { fieldErrors },
  };
}

// catch (e: any) {

//       console.log(e)
//       const fe = e?.response?.data?.errors?.fieldErrors;

//       if (fe?.name)  form.setError("name",  { type: "server", message: fe.name[0] });
//       if (fe?.type)  form.setError("type",  { type: "server", message: fe.type[0] });
//       if (fe?.phone) form.setError("phoneNumber", { type: "server", message: fe.phone[0] });
//       if (fe?.email) form.setError("email", { type: "server", message: fe.email[0] });

//       toast(e?.response?.data?.error || "Something went wrong",);
//     }


// final look
// how it send res
// {
//   "success": false,
//   "message": "Validation failed",
//   "errors": {
//     "fieldErrors": {
//       "name": ["Name is required"],
//       "phone": ["Phone must be in format like +919876543210"]
//     }
//   }
// }

// intial look 
// ZOD ERROR EXAMPLE 
// {
//   "name": "ZodError",
//   "issues": [
//     {
//       "code": "too_small",
//       "minimum": 1,
//       "type": "string",
//       "inclusive": true,
//       "exact": false,
//       "message": "Name required",
//       "path": ["name"]
//     },
//     {
//       "code": "too_small",
//       "minimum": 18,
//       "type": "number",
//       "inclusive": true,
//       "exact": false,
//       "message": "Too young",
//       "path": ["age,name"]
//       generally as one path but it can be multiple , so join converts them into string if one assigned to felid name , if many converts them into string
//       seperated by . and assign to felid name
//     }
//   ],
//   "message": "Name required\nToo young"
// }