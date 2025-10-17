import { Component ,DestroyRef,OnInit,inject} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, of } from 'rxjs';

//custom validator
function mustContainQuestionMark(control: AbstractControl){
    if(control.value.includes('?')){
        return null;
    }

    return { 
        doesNotContainQuestionMark: true
     };
}
//async validator
function emailIsUnique(control: AbstractControl){
    if(control.value !== 'test@example.com'){
        return of(null); // produces observable that returns value instantly
    }
    return of({notUnique: true});
}

let initialEmailValue = '';
const savedForm = window.localStorage.getItem('saved-login-form');

if(savedForm){
    const loadedForm = JSON.parse(savedForm);
    initialEmailValue = loadedForm.email;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports:[ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
//reactive
export class LoginComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    form = new FormGroup({
        email: new FormControl(initialEmailValue, {
            validators: [ Validators.email,Validators.required ],
             asyncValidators: [emailIsUnique]
        }),
        password: new FormControl('',{
            validators: [Validators.required,Validators.minLength(6),mustContainQuestionMark],
           
        })
    });

    get emailIsInvalid(){
        return this.form.controls.email.touched && this.form.controls.email.dirty && this.form.controls.email.invalid
    }
    get passwordIsInvalid(){
        return this.form.controls.password.touched && this.form.controls.password.dirty && this.form.controls.password.invalid;
    }

    ngOnInit() {
        // const savedForm = window.localStorage.getItem('saved-login-form');
        // if(savedForm){
        //     const loadedForm = JSON.parse(savedForm);
        //     this.form.patchValue({
        //         email: loadedForm.email,
        //     }); // partially update overall form
        // }
        const subcscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
            next: value => {
                window.localStorage.setItem('saved-login-form',JSON.stringify({email:value.email}))
            }
        }); 
        
        this.destroyRef.onDestroy(()=> subcscription.unsubscribe());
    }

    onSubmit(){
        console.log(this.form);
        const enteredEmail = this.form.value.email;
        const enteredPassword = this.form.value.password;
        console.log(enteredEmail,enteredPassword)
    }
}